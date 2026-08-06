import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { analyzeConversation } from "@/lib/claude";
import { indexSession } from "@/lib/rag";
import { FREE_DAILY_LIMIT, seoulDayKey } from "@/lib/usage";
import type { AnalyzeRequest, StoredSession } from "@/lib/types";

// 관계 메모 최대 길이 (프롬프트 주입/토큰 낭비 방지)
const RELATIONSHIP_MAX = 200;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "로그인이 필요해요." },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  let body: AnalyzeRequest;
  try {
    body = (await req.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const rawText = (body.rawText ?? "").trim();
  if (rawText.length < 10) {
    return NextResponse.json(
      { error: "대화 내용을 10자 이상 입력해주세요." },
      { status: 400 }
    );
  }
  if (rawText.length > 12000) {
    return NextResponse.json(
      { error: "대화가 너무 깁니다. 12,000자 이하로 잘라서 입력해주세요." },
      { status: 400 }
    );
  }

  const relationship = (body.relationship ?? "").trim();
  if (relationship.length > RELATIONSHIP_MAX) {
    return NextResponse.json(
      { error: `관계 상태 메모는 ${RELATIONSHIP_MAX}자 이하로 입력해주세요.` },
      { status: 400 }
    );
  }

  // 하루 무료 제한 — Claude 호출 "전에" 원자적으로 한 슬롯을 선점한다.
  // upsert-increment 는 같은 (userId, day) 행에 대해 DB가 직렬화하므로,
  // 동시 요청이 와도 각기 다른 count 값을 돌려받아 한도 초과분만 정확히 거른다.
  const day = seoulDayKey();
  const usage = await prisma.dailyUsage.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (usage.count > FREE_DAILY_LIMIT) {
    // 한도 초과 — 방금 올린 카운트를 되돌리고 거절
    await prisma.dailyUsage.update({
      where: { userId_day: { userId, day } },
      data: { count: { decrement: 1 } },
    });
    return NextResponse.json(
      {
        error: `무료 분석은 하루 ${FREE_DAILY_LIMIT}회까지예요. 내일 다시 이용하거나 유료 플랜을 준비 중이에요.`,
      },
      { status: 429 }
    );
  }

  let result;
  try {
    result = await analyzeConversation(rawText, relationship);
  } catch (err) {
    console.error("[analyze] Claude 호출 실패:", err);
    // 호출 자체가 실패했으면 선점한 슬롯을 환불(사용자가 재시도 가능하도록)
    await prisma.dailyUsage
      .update({
        where: { userId_day: { userId, day } },
        data: { count: { decrement: 1 } },
      })
      .catch(() => {});
    return NextResponse.json(
      { error: "분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }

  // 제목 자동 생성: 사용자가 준 title 없으면 대화 첫 줄에서 추출
  const title =
    body.title?.trim() ||
    rawText.split("\n").find((l) => l.trim().length > 0)?.slice(0, 40) ||
    "제목 없는 분석";

  const stored = await prisma.analysisSession.create({
    data: {
      userId,
      title,
      rawText,
      score: result.score,
      resultJson: result as unknown as object,
      replySuggestions: {
        create: result.replySuggestions.map((r) => ({
          tone: r.tone,
          content: r.content,
        })),
      },
    },
  });

  // ===== [마일스톤1: 청킹·임베딩·저장] — 분석 저장 시 자동 인덱싱 =====
  // 대화를 청킹·임베딩해 저장(indexSession) → 나중에 히스토리 의미 검색이 가능해짐.
  // 실패해도 분석 결과 반환은 막지 않는다 (부가 기능).
  try {
    await indexSession(stored.id, userId, rawText);
  } catch (err) {
    console.error("[analyze] RAG 인덱싱 실패:", err);
  }

  const payload: StoredSession = {
    id: stored.id,
    title: stored.title,
    rawText: stored.rawText,
    score: stored.score,
    result,
    createdAt: stored.createdAt.toISOString(),
  };

  return NextResponse.json(payload, { status: 201 });
}

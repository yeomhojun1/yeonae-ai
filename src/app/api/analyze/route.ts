import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeConversation } from "@/lib/claude";
import type { AnalyzeRequest, StoredSession } from "@/lib/types";

// 무료 하루 분석 횟수 제한 (MVP용 간단 버전 — 전체 기준)
const FREE_DAILY_LIMIT = 3;

export async function POST(req: Request) {
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

  // 하루 무료 제한 체크 (오늘 자정 기준)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await prisma.analysisSession.count({
    where: { createdAt: { gte: startOfDay } },
  });
  if (todayCount >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: `무료 분석은 하루 ${FREE_DAILY_LIMIT}회까지예요. 내일 다시 이용하거나 유료 플랜을 준비 중이에요.`,
      },
      { status: 429 }
    );
  }

  let result;
  try {
    result = await analyzeConversation(rawText, body.relationship);
  } catch (err) {
    console.error("[analyze] Claude 호출 실패:", err);
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

  const session = await prisma.analysisSession.create({
    data: {
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

  const payload: StoredSession = {
    id: session.id,
    title: session.title,
    rawText: session.rawText,
    score: session.score,
    result,
    createdAt: session.createdAt.toISOString(),
  };

  return NextResponse.json(payload, { status: 201 });
}

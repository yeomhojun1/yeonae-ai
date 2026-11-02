import { NextResponse } from "next/server";
import type { AnalyzeRequest, StoredSession } from "@/lib/types";
import { analyzeConversation } from "@/lib/claude";
import { clientIp, refundDemoSlot, takeDemoSlot } from "@/lib/demo-limit";
import { DEMO_MAX_CHARS, FREE_DAILY_LIMIT } from "@/lib/usage";

// 비로그인 데모 분석: 실제 AI(Gemini)로 분석한다. DB 저장은 하지 않는다(세션 미보관).
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
  if (rawText.length > DEMO_MAX_CHARS) {
    return NextResponse.json(
      { error: `대화가 너무 길어요. ${DEMO_MAX_CHARS}자 이내로 줄여주세요.` },
      { status: 400 }
    );
  }

  // 하루 호출 제한 — 입력 검증을 통과한 요청만, AI 호출 "전에" 선점한다.
  const ip = clientIp(req);
  const slot = takeDemoSlot(ip);
  if (!slot.ok) {
    const error =
      slot.reason === "ip"
        ? `무료 분석은 하루 ${FREE_DAILY_LIMIT}회까지예요. 내일 다시 이용해주세요.`
        : "오늘 무료 분석이 모두 소진됐어요. 내일 다시 이용해주세요.";
    return NextResponse.json({ error }, { status: 429 });
  }

  try {
    const result = await analyzeConversation(rawText, body.relationship);
    const payload: StoredSession = {
      id: "demo",
      title: body.title?.trim() || "데모 분석",
      rawText,
      score: result.score,
      result,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    console.error("[demo-analyze]", e);
    refundDemoSlot(ip);
    return NextResponse.json(
      { error: "AI 분석에 실패했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}

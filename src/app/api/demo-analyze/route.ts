import { NextResponse } from "next/server";
import type { AnalyzeRequest, StoredSession } from "@/lib/types";
import { analyzeConversation } from "@/lib/claude";

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
  if (rawText.length > 8000) {
    return NextResponse.json(
      { error: "대화가 너무 길어요. 8000자 이내로 줄여주세요." },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "AI 분석에 실패했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}

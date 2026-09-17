import { NextResponse } from "next/server";
import type { AnalyzeRequest, AnalysisResult, StoredSession } from "@/lib/types";

// ⚠️ 데모 전용: 실제 Claude API를 호출하지 않고 고정 샘플 결과를 반환합니다.
// (프로덕션에서 비로그인 사용자가 API 비용을 발생시키지 못하도록 차단.
//  실제 분석은 로그인 후 /api/analyze 에서만 수행됩니다.)
const SAMPLE_RESULT: AnalysisResult = {
  score: 72,
  interestLevel: "높음", // ANALYSIS_SCHEMA(claude.ts)의 enum 값만 사용
  summary:
    "※ 데모 화면에서는 미리 준비된 샘플 결과를 보여드려요. 내 대화로 실제 분석을 받으려면 로그인 후 이용해주세요. — 전반적으로 상대방이 대화를 이어가려는 의지가 보여요. 답장 간격이 일정하고 질문을 되돌려주는 패턴이 긍정적이에요.",
  signals: [
    { type: "positive", text: "상대방이 먼저 질문을 던지며 대화를 이어가요." },
    { type: "positive", text: "이모티콘·웃음 표현이 늘어나는 추세예요." },
    { type: "neutral", text: "답장 길이가 들쭉날쭉해요. 바쁜 시기일 수 있어요." },
    { type: "negative", text: "약속 제안에 대한 확답을 피하는 구간이 있어요." },
  ],
  replySuggestions: [
    { tone: "가볍게", content: "오늘 얘기하다 보니 시간 순삭이었네요 ㅋㅋ 다음에 또 얘기해요!" },
    { tone: "진솔하게", content: "요즘 대화하는 게 은근 기다려져요. 이번 주말에 시간 되면 커피 어때요?" },
    { tone: "밀당", content: "흠 그 얘기는 만나서 들어야 할 것 같은데요?" },
  ],
  nextActions: [
    "구체적인 날짜·장소를 넣어 가볍게 만남을 제안해보세요.",
    "상대가 확답을 피한 주제는 한 템포 쉬었다가 다시 꺼내세요.",
  ],
};

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

  const payload: StoredSession = {
    id: "demo",
    title: body.title?.trim() || "데모 분석 (샘플)",
    rawText,
    score: SAMPLE_RESULT.score,
    result: SAMPLE_RESULT,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, { status: 200 });
}

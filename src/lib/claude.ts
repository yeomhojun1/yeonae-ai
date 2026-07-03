import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "./types";

const MODEL = "claude-opus-4-8";

// 분석 결과를 강제할 JSON 스키마 (Structured Outputs)
const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: {
      type: "integer",
      description: "상대방 호감도와 대화 흐름을 종합한 0~100 점수. 높을수록 긍정적.",
    },
    interestLevel: {
      type: "string",
      enum: ["매우 높음", "높음", "보통", "낮음", "매우 낮음"],
      description: "상대방의 호감도 수준",
    },
    summary: {
      type: "string",
      description: "대화 흐름과 현재 관계 상태에 대한 2~4문장 요약. 단정하지 말고 조심스럽게.",
    },
    signals: {
      type: "array",
      description: "대화에서 포착한 긍정 신호, 위험 신호, 참고 신호",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["positive", "negative", "neutral"],
          },
          text: { type: "string" },
        },
        required: ["type", "text"],
      },
    },
    replySuggestions: {
      type: "array",
      description: "내가 보낼 만한 자연스러운 답장 3개. AI 티가 나지 않게, 실제 사람이 쓴 것처럼.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          tone: {
            type: "string",
            description: "답장의 톤. 예) 가볍게, 진솔하게, 밀당",
          },
          content: { type: "string" },
        },
        required: ["tone", "content"],
      },
    },
    nextActions: {
      type: "array",
      description: "추천하는 다음 행동 2~4개",
      items: { type: "string" },
    },
  },
  required: [
    "score",
    "interestLevel",
    "summary",
    "signals",
    "replySuggestions",
    "nextActions",
  ],
} as const;

const SYSTEM_PROMPT = `너는 한국의 연애 대화 분석 코치야. 사용자가 붙여넣은 카톡/DM 대화나 소개팅·썸 상황을 읽고 분석해.

원칙:
- "나"는 사용자 본인이고, 상대방과의 대화를 분석하는 거야.
- 상대방의 마음을 단정적으로 진단하지 마. "~일 수 있어요", "~로 보여요"처럼 조심스럽고 확률적으로 표현해.
- 답장 추천은 자연스럽고 사람 냄새 나게 써. AI가 쓴 티가 나거나 오글거리는 문장은 금지.
- 위험 신호(관심 식음, 회피, 읽씹 패턴 등)가 보이면 signals에 negative 타입으로 솔직하게 알려줘.
- 과장하거나 헛된 희망을 주지 말고, 근거를 대화에서 찾아 현실적으로 조언해.
- 모든 답변은 한국어로.`;

/**
 * 대화 텍스트를 분석해서 구조화된 결과를 반환.
 * ANTHROPIC_API_KEY가 없으면 목업 결과를 반환해 키 없이도 앱을 확인할 수 있게 함.
 */
export async function analyzeConversation(
  rawText: string,
  relationship?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return mockAnalysis(rawText);
  }

  const client = new Anthropic({ apiKey });

  const userContent = [
    relationship?.trim()
      ? `관계 상태 메모: ${relationship.trim()}`
      : null,
    "아래는 나와 상대방의 대화야. 분석해줘.",
    "----- 대화 시작 -----",
    rawText.trim(),
    "----- 대화 끝 -----",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    output_config: {
      format: {
        type: "json_schema",
        schema: ANALYSIS_SCHEMA,
      },
    },
    messages: [{ role: "user", content: userContent }],
  });

  // structured output이 보장되어 첫 text 블록이 유효한 JSON
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("분석 결과를 받지 못했습니다.");
  }

  const parsed = JSON.parse(textBlock.text) as AnalysisResult;
  return normalize(parsed);
}

function normalize(r: AnalysisResult): AnalysisResult {
  return {
    ...r,
    score: Math.max(0, Math.min(100, Math.round(r.score))),
    signals: r.signals ?? [],
    replySuggestions: r.replySuggestions ?? [],
    nextActions: r.nextActions ?? [],
  };
}

/** API 키 없이도 UI를 확인할 수 있도록 하는 목업 분석 결과 */
function mockAnalysis(rawText: string): AnalysisResult {
  const len = rawText.trim().length;
  const score = Math.max(35, Math.min(85, 50 + (len % 40)));
  return {
    score,
    interestLevel: score >= 70 ? "높음" : score >= 50 ? "보통" : "낮음",
    summary:
      "(목업 결과) ANTHROPIC_API_KEY가 설정되지 않아 예시 분석을 보여주고 있어요. " +
      ".env 파일에 API 키를 넣으면 실제 Claude 분석 결과가 나옵니다.",
    signals: [
      { type: "positive", text: "상대방이 대화를 먼저 이어가려는 시도가 보여요." },
      { type: "neutral", text: "답장 간격이 일정한 편이라 관심도 판단엔 추가 관찰이 필요해요." },
      { type: "negative", text: "질문에 단답으로 끝나는 구간이 있어 주의가 필요해요." },
    ],
    replySuggestions: [
      { tone: "가볍게", content: "오늘 하루 어땠어? 나는 좀 정신없었네ㅋㅋ" },
      { tone: "진솔하게", content: "얘기하다 보니까 너랑 대화하는 게 재밌더라. 이번 주에 시간 되면 잠깐 볼래?" },
      { tone: "밀당", content: "음~ 그건 만나서 얘기해줄게 :)" },
    ],
    nextActions: [
      "가벼운 공통 관심사로 대화를 한 번 더 이어보기",
      "무리한 고백보다 자연스러운 만남 제안 타이밍 살피기",
      "실제 분석을 원하면 .env에 ANTHROPIC_API_KEY 설정하기",
    ],
  };
}

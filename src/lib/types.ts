// 분석 결과 타입 정의 (Claude 응답 및 클라이언트에서 공용으로 사용)

export type SignalType = "positive" | "negative" | "neutral";

export interface Signal {
  /** positive: 좋은 신호, negative: 위험 신호, neutral: 참고 신호 */
  type: SignalType;
  text: string;
}

export interface ReplySuggestion {
  /** 답장 톤: 예) "가볍게", "진솔하게", "밀당" */
  tone: string;
  content: string;
}

export interface AnalysisResult {
  /** 전체 흐름/호감도 점수 (0~100) */
  score: number;
  /** 상대방 호감도 요약: 예) "높음" */
  interestLevel: string;
  /** 대화 흐름/관계 상태 요약 */
  summary: string;
  /** 긍정/위험/참고 신호 목록 */
  signals: Signal[];
  /** 추천 답장 (보통 3개) */
  replySuggestions: ReplySuggestion[];
  /** 추천하는 다음 행동 */
  nextActions: string[];
}

/** 분석 API 요청 바디 */
export interface AnalyzeRequest {
  rawText: string;
  title?: string;
  /** 관계 상태 메모: 예) "소개팅 2번 함", "썸 3주차" */
  relationship?: string;
}

/** 저장된 분석 세션 (목록/상세 응답) */
export interface StoredSession {
  id: string;
  title: string;
  rawText: string;
  score: number;
  result: AnalysisResult;
  createdAt: string;
}

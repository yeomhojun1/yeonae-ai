// 데모 모드(정적 빌드)에서 서버 API 대신 브라우저 안에서 동작하는 분석·검색 함수.
// 실제 AI·DB를 부르지 않고, 미리 준비한 결과만 돌려준다.
import type { AnalyzeRequest, StoredSession } from "@/lib/types";
import { DEMO_SAMPLES } from "./samples";
import searchData from "./search-results.json";

/** 검색 결과 한 건 (rag.ts SearchHit 과 같은 모양. rag.ts 는 prisma 를 불러 데모에서 쓰지 않는다) */
export interface DemoSearchHit {
  chunkId: string;
  sessionId: string;
  sessionTitle: string;
  text: string;
  score: number;
}

export { DEMO_SAMPLES };
export type { DemoSample } from "./samples";

export const DEMO_ONLY_SAMPLE_MESSAGE =
  "데모 모드에서는 샘플 대화만 분석할 수 있습니다. 위의 샘플 대화 버튼을 눌러 주세요.";
export const DEMO_ONLY_QUERY_MESSAGE =
  "데모 모드에서는 준비된 검색어만 검색할 수 있습니다. 예시 검색어 버튼을 눌러 주세요.";

/** 줄 끝 공백·빈 줄·줄바꿈 형식(CRLF) 차이는 무시하고 비교한다. */
export function normalizeConversation(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
}

export type DemoResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function demoAnalyze(req: AnalyzeRequest): DemoResult<StoredSession> {
  const text = normalizeConversation(req.rawText ?? "");
  const sample = DEMO_SAMPLES.find(
    (s) => normalizeConversation(s.rawText) === text
  );
  if (!sample) return { ok: false, error: DEMO_ONLY_SAMPLE_MESSAGE };
  const { id, title, rawText, score, result, createdAt } = sample;
  return { ok: true, data: { id, title, rawText, score, result, createdAt } };
}

export const DEMO_QUERIES: string[] = searchData.results.map((r) => r.query);

export function demoSearch(query: string): DemoResult<DemoSearchHit[]> {
  const q = query.trim().replace(/\s+/g, " ");
  const found = searchData.results.find((r) => r.query === q);
  if (!found) return { ok: false, error: DEMO_ONLY_QUERY_MESSAGE };
  return { ok: true, data: found.hits };
}

export function getDemoSession(id: string) {
  return DEMO_SAMPLES.find((s) => s.id === id) ?? null;
}

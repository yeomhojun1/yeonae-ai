// RAG 2단계: 임베딩(Embedding) + 유사도
// 문장을 "의미 좌표(벡터)"로 바꾸고, 두 좌표의 가까운 정도를 잰다.
//
// 학습용 심플 버전: 로컬 모델(multilingual-e5-small)을 Node에서 실행 → API 키·과금 없음.
// (프로덕션에선 Voyage/OpenAI 같은 호스팅 임베딩 API로 교체 예정 — Phase 5)

import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

const MODEL = "Xenova/multilingual-e5-small"; // 한국어 지원, 384차원
export const EMBEDDING_DIM = 384;

// 모델 로딩은 무거우므로 프로세스당 한 번만 (싱글턴)
let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;
function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", MODEL);
  }
  return embedderPromise;
}

// e5 계열 규칙: 검색어엔 "query:", 문서(조각)엔 "passage:" 접두어를 붙인다.
type EmbedKind = "query" | "passage";
function withPrefix(text: string, kind: EmbedKind): string {
  return (kind === "query" ? "query: " : "passage: ") + text;
}

/** 문장 하나를 의미 좌표(정규화된 384차원 벡터)로 변환 */
export async function embed(text: string, kind: EmbedKind): Promise<number[]> {
  const embedder = await getEmbedder();
  const output = await embedder(withPrefix(text, kind), {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data as Float32Array);
}

/** 여러 문장을 한 번에 임베딩 (순차 처리 — 학습용이라 단순하게) */
export async function embedBatch(
  texts: string[],
  kind: EmbedKind
): Promise<number[][]> {
  const out: number[][] = [];
  for (const t of texts) out.push(await embed(t, kind));
  return out;
}

/**
 * 코사인 유사도: 두 벡터가 같은 방향을 가리키는 정도 (1=비슷, 0=무관).
 * embed()가 normalize:true라 이미 단위벡터 → 사실상 내적(dot product)과 같다.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

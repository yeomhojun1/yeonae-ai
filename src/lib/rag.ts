// RAG 파이프라인 헬퍼
// 대화 하나를 받아 청킹 → 임베딩 → DB 저장(인덱싱)까지 수행.

import { prisma } from "./prisma";
import { chunkConversation } from "./chunk";
import { embed, embedBatch, cosineSimilarity } from "./embeddings";

/**
 * 대화(rawText)를 조각내고 각 조각을 임베딩해서 ConversationChunk로 저장한다.
 * 이미 인덱싱된 세션이면(기존 조각 존재) 먼저 지우고 다시 만든다(재인덱싱).
 * @returns 저장된 조각 개수
 */
export async function indexSession(
  sessionId: string,
  userId: string,
  rawText: string
): Promise<number> {
  const chunks = chunkConversation(rawText);
  if (chunks.length === 0) return 0;

  // 조각들을 "passage"로 임베딩 (검색어는 나중에 "query"로)
  const embeddings = await embedBatch(
    chunks.map((c) => c.text),
    "passage"
  );

  // 재인덱싱 안전성: 기존 조각 제거 후 새로 저장
  await prisma.conversationChunk.deleteMany({ where: { sessionId } });
  await prisma.conversationChunk.createMany({
    data: chunks.map((c, i) => ({
      sessionId,
      userId,
      index: c.index,
      text: c.text,
      embedding: embeddings[i],
    })),
  });

  return chunks.length;
}

/** 검색 결과 한 건 */
export interface SearchHit {
  chunkId: string;
  sessionId: string;
  sessionTitle: string;
  text: string;
  /** 코사인 유사도 (0~1). 절대값보단 순위로 해석할 것. */
  score: number;
}

/**
 * 사용자의 모든 대화 조각 중 질문과 의미가 가까운 top-k를 찾는다. (RAG의 검색 단계)
 *
 * 학습용 심플: 사용자의 조각을 전부 불러와 JS에서 코사인 유사도 계산.
 * (조각 수가 커지면 pgvector로 DB에서 계산하도록 업그레이드 — Phase 5)
 */
export async function searchChunks(
  userId: string,
  query: string,
  k = 5
): Promise<SearchHit[]> {
  // ① 질문을 "query"로 임베딩 (조각은 "passage"였음 — e5 규칙)
  const queryVec = await embed(query, "query");

  // ② 사용자 범위의 조각 전부 로드
  const chunks = await prisma.conversationChunk.findMany({
    where: { userId },
    select: {
      id: true,
      sessionId: true,
      text: true,
      embedding: true,
      session: { select: { title: true } },
    },
  });

  // ③ 검색 = 그냥 수학: 코사인 유사도 계산 후 정렬해서 top-k
  return chunks
    .map((c) => ({
      chunkId: c.id,
      sessionId: c.sessionId,
      sessionTitle: c.session.title,
      text: c.text,
      score: cosineSimilarity(queryVec, c.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

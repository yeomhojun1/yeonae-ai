// RAG 파이프라인 헬퍼
// 대화 하나를 받아 청킹 → 임베딩 → DB 저장(인덱싱)까지 수행.

import { prisma } from "./prisma";
import { chunkConversation } from "./chunk";
import { embed, embedBatch, cosineSimilarity } from "./embeddings";

/**
 * ===== [마일스톤1: 청킹·임베딩·저장] — 인덱싱 함수 =====
 * 대화(rawText)를 조각내고(청킹) 각 조각을 임베딩해서 ConversationChunk로 저장한다.
 * 이미 인덱싱된 세션이면(기존 조각 존재) 먼저 지우고 다시 만든다(재인덱싱).
 * (chunk.ts + embeddings.ts를 여기서 조합해 쓴다.)
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

  // ===== [마일스톤5] pgvector 전용 칸(embedding_vec)도 함께 채우기 =====
  // Prisma는 vector 타입을 직접 못 다뤄서 raw SQL(생 SQL)로 넣는다.
  const created = await prisma.conversationChunk.findMany({
    where: { sessionId }, // 방금 저장한 이 세션의 조각들을
    orderBy: { index: "asc" }, // 순서(index)대로 가져와서
    select: { id: true }, // id만 필요 (어느 행을 업데이트할지 알려고)
  });
  for (let i = 0; i < created.length; i++) {
    const lit = `[${embeddings[i].join(",")}]`; // 좌표(숫자배열)를 "[0.1,0.2,...]" 문자열로
    await prisma.$executeRawUnsafe(
      // 그 행의 벡터 칸에 좌표 넣기 ($1=좌표, $2=행 id). ::vector = 벡터 타입으로 변환
      `UPDATE "ConversationChunk" SET embedding_vec = $1::vector WHERE id = $2`,
      lit,
      created[i].id
    );
  }

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
 * ===== [마일스톤2: 검색] — JS 버전 검색 =====
 * 사용자의 모든 대화 조각 중 질문과 의미가 가까운 top-k를 찾는다.
 *
 * 학습용 심플: 사용자의 조각을 "전부 불러와" JS에서 코사인 유사도 계산.
 * (조각이 많아지면 느림 → 마일스톤5의 searchChunksPg로 업그레이드했음. 둘을 비교해보라.)
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

/**
 * ===== [마일스톤5] pgvector 검색 (프로덕션급) =====
 * 유사도 계산·정렬을 "DB가 직접" 수행 → 조각이 수만 개여도 빠름 (도서관 사서에게 부탁하는 방식).
 * 위의 searchChunks(JS)와 결과는 같지만, 계산 위치가 JS→DB로 바뀐 것.
 * `<=>` = 코사인 거리 연산자(작을수록 가까움). 1 - 거리 = 유사도.
 */
export async function searchChunksPg(
  userId: string,
  query: string,
  k = 5
): Promise<SearchHit[]> {
  const queryVec = await embed(query, "query"); // 질문을 좌표(벡터)로 변환
  const lit = `[${queryVec.join(",")}]`; // 좌표를 "[...]" 문자열로 (SQL에 넘기려고)

  // DB에게 "이 좌표랑 가까운 top-k 조각 찾아줘"라고 SQL로 부탁 (실제 계산은 DB가 함)
  const rows = await prisma.$queryRawUnsafe<
    { chunkId: string; sessionId: string; sessionTitle: string; text: string; score: number }[]
  >(
    `SELECT c.id AS "chunkId", c."sessionId" AS "sessionId",   -- 어느 조각/세션인지
            s.title AS "sessionTitle", c.text AS "text",        -- 세션 제목 + 조각 원문
            1 - (c.embedding_vec <=> $1::vector) AS score        -- 유사도 = 1 - 코사인거리
     FROM "ConversationChunk" c
     JOIN "AnalysisSession" s ON s.id = c."sessionId"            -- 조각에 세션 제목 붙이기
     WHERE c."userId" = $2 AND c.embedding_vec IS NOT NULL       -- 이 사용자의, 벡터 있는 것만
     ORDER BY c.embedding_vec <=> $1::vector                     -- 질문 좌표와 가까운 순 정렬(인덱스 사용)
     LIMIT $3                                                    -- 상위 k개만
`,
    lit, // $1 = 질문 좌표
    userId, // $2 = 사용자 id
    k // $3 = 몇 개(top-k)
  );
  return rows; // DB가 정렬해서 돌려준 top-k를 그대로 반환
}

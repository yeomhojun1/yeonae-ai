// 마일스톤 5: pgvector 셋업 (안전·추가만)
//  ① pgvector 확장 켜기
//  ② ConversationChunk에 vector(384) 컬럼 추가 (기존 Float[] embedding은 유지)
//  ③ 기존 조각들의 임베딩을 벡터 컬럼으로 백필
//  ④ 유사도 검색용 인덱스 생성
// 실행: npx tsx scripts/setup-pgvector.ts   (무료, DB 스키마 추가)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnv();
  const { prisma } = await import("../src/lib/prisma");

  console.log("① pgvector 확장 켜는 중...");
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);

  console.log("② vector(384) 컬럼 추가 중...");
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "ConversationChunk" ADD COLUMN IF NOT EXISTS embedding_vec vector(384)`
  );

  console.log("③ 기존 임베딩을 벡터 컬럼으로 백필 중...");
  const chunks = await prisma.conversationChunk.findMany({
    select: { id: true, embedding: true },
  });
  let n = 0;
  for (const c of chunks) {
    if (!c.embedding || c.embedding.length === 0) continue;
    const lit = `[${c.embedding.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE "ConversationChunk" SET embedding_vec = $1::vector WHERE id = $2`,
      lit,
      c.id
    );
    n++;
  }
  console.log(`   ${n}개 조각 백필 완료`);

  console.log("④ 코사인 유사도 인덱스 생성 중...");
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS conversationchunk_embvec_idx
     ON "ConversationChunk" USING hnsw (embedding_vec vector_cosine_ops)`
  );

  // 검증
  const [{ cnt }] = await prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
    `SELECT count(*)::int AS cnt FROM "ConversationChunk" WHERE embedding_vec IS NOT NULL`
  );
  console.log(`\n[검증] 벡터 채워진 조각: ${cnt}개`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

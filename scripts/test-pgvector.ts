// 검증: JS 코사인 검색(searchChunks) vs pgvector 검색(searchChunksPg)
// 같은 질문에 같은 결과가 나와야 한다 (방식만 JS→DB로 바뀐 것).
// 실행: npx tsx scripts/test-pgvector.ts "질문"

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
  const { searchChunks, searchChunksPg } = await import("../src/lib/rag");

  const anyChunk = await prisma.conversationChunk.findFirst({ select: { userId: true } });
  if (!anyChunk) { console.log("조각 없음"); return; }
  const query = process.argv[2] ?? "상대가 서운하거나 기분 상한 부분";
  console.log(`질문: "${query}"\n`);

  const js = await searchChunks(anyChunk.userId, query, 5);
  const pg = await searchChunksPg(anyChunk.userId, query, 5);

  console.log("[JS 코사인]");
  js.forEach((h, i) => console.log(`  ${i + 1}. [${(h.score * 100).toFixed(1)}%] ${h.text.replace(/\n/g, " ").slice(0, 45)}`));
  console.log("\n[pgvector]");
  pg.forEach((h, i) => console.log(`  ${i + 1}. [${(h.score * 100).toFixed(1)}%] ${h.text.replace(/\n/g, " ").slice(0, 45)}`));

  const same = js.map((h) => h.chunkId).join(",") === pg.map((h) => h.chunkId).join(",");
  console.log(`\n결과 순서 동일? ${same ? "✅ YES (마이그레이션 정상)" : "❌ 다름"}`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

// 검색 검증 스크립트: searchChunks를 직접 호출해 top-k 결과를 출력.
// 실행: npx tsx scripts/test-search.ts "찾을 질문"

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split(
    "\n"
  )) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  loadEnv();
  const { prisma } = await import("../src/lib/prisma");
  const { searchChunks } = await import("../src/lib/rag");

  const anyChunk = await prisma.conversationChunk.findFirst({
    select: { userId: true },
  });
  if (!anyChunk) {
    console.log("인덱싱된 조각이 없어요. 먼저 reindex-rag.ts를 돌리세요.");
    return;
  }

  const query = process.argv[2] ?? "상대가 서운하거나 기분 상한 부분";
  console.log(`질문: "${query}"\n`);

  const hits = await searchChunks(anyChunk.userId, query, 5);
  hits.forEach((h, i) => {
    console.log(
      `${i + 1}. [${(h.score * 100).toFixed(0)}%] (${h.sessionTitle})`
    );
    console.log(`   ${h.text.replace(/\n/g, " / ").slice(0, 80)}\n`);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

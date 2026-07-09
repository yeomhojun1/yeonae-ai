// 백필/검증 스크립트: 저장된 모든 분석 세션을 RAG 인덱싱한다.
// 실행: npx tsx scripts/reindex-rag.ts
//
// (인증 없이 DB에 직접 접근 — 로컬 개발/검증 전용)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// .env 로드 (node18 호환, 추가 의존성 없이). prisma import 전에 먼저 실행돼야 함.
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
  const { indexSession } = await import("../src/lib/rag");

  const sessions = await prisma.analysisSession.findMany({
    select: { id: true, userId: true, rawText: true },
  });
  console.log(`분석 세션 ${sessions.length}개 인덱싱 시작...\n`);

  let total = 0;
  for (const s of sessions) {
    const n = await indexSession(s.id, s.userId, s.rawText);
    total += n;
    console.log(`  세션 ${s.id.slice(0, 8)} → 조각 ${n}개`);
  }
  console.log(`\n총 저장된 조각: ${total}개`);

  // 저장 검증: 샘플 하나 꺼내서 원문 일부와 임베딩 차원 확인
  const sample = await prisma.conversationChunk.findFirst();
  if (sample) {
    console.log(`\n[검증] 샘플 조각 원문: "${sample.text.slice(0, 60)}..."`);
    console.log(`[검증] 임베딩 차원: ${sample.embedding.length} (기대값 384)`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

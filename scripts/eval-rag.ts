// 캡스톤 마일스톤 4: RAG 검색 정확도 평가 (Phase 3 실전)
// 골든셋(정답지)으로 Recall@k / Precision@k / F1 를 자동 측정한다.
// 앱의 실제 임베딩 코드(embeddings.ts)를 그대로 사용 → "우리 앱 RAG의 진짜 점수".
// 실행: npx tsx scripts/eval-rag.ts   (무료, 로컬, DB 안 건드림)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split(
    "\n"
  )) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// --- 테스트 corpus: 다양한 연애 대화 조각 (검색 대상) ---
const CORPUS = [
  "나: 어제 연락 왜 안 받았어? / 상대: 아 바빴어 / 나: 서운하네 / 상대: 미안 다음엔 할게",      // 0 서운/무심
  "상대: 오늘 너 생각 많이 났어ㅎㅎ / 나: 왜? / 상대: 그냥 보고싶어서 / 나: 나도!",              // 1 호감/설렘
  "나: 점심 뭐 먹었어? / 상대: 김치찌개 / 나: 맛있겠다 / 상대: ㅇㅇ",                            // 2 일상 잡담
  "나: 이번 주말 약속 취소됐어 / 상대: 또? 세 번째잖아 / 나: 미안해 / 상대: 좀 실망이야",         // 3 갈등/실망
  "상대: 나 이번에 이직해 / 나: 오 축하해! 어디로? / 상대: IT 회사 / 나: 잘됐다",               // 4 정보성/무관
  "나: 답장이 좀 느리네? / 상대: 아 미안 요즘 정신없어 / 나: 바쁜가보다 / 상대: 응 좀",          // 5 거리두기
  "나: 우리 이번 주에 영화 볼래? / 상대: 좋아! 뭐 볼까 / 나: 겨울왕국 어때 / 상대: 콜",          // 6 데이트 제안
  "상대: 먼저 연락해봤어 뭐하나 싶어서 / 나: 오 웬일 / 상대: 그냥 궁금했어 / 나: 고마워ㅎㅎ",     // 7 관심 표현
];

// --- 골든셋: 질문마다 "정답 조각" 인덱스 (사람이 정함) ---
const GOLDEN = [
  { query: "상대가 서운해하거나 나한테 실망한 부분", relevant: [0, 3] },
  { query: "상대가 나한테 호감이나 관심을 보인 순간", relevant: [1, 7] },
  { query: "만남이나 데이트를 제안한 대화", relevant: [6] },
];

function recallPrecision(ranked: number[], relevant: number[], k: number) {
  const topK = ranked.slice(0, k);
  const hit = topK.filter((i) => relevant.includes(i)).length;
  return { recall: hit / relevant.length, precision: hit / k };
}

async function main() {
  loadEnv();
  const { embed, cosineSimilarity } = await import("../src/lib/embeddings");

  // corpus를 passage로 임베딩 (앱과 동일)
  const corpusVecs: number[][] = [];
  for (const text of CORPUS) corpusVecs.push(await embed(text, "passage"));

  for (const k of [3, 5]) {
    let sumR = 0, sumP = 0;
    console.log(`\n================  top-${k}  ================`);
    for (const g of GOLDEN) {
      const qVec = await embed(g.query, "query");
      const ranked = CORPUS.map((_, i) => ({ i, s: cosineSimilarity(qVec, corpusVecs[i]) }))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.i);
      const { recall, precision } = recallPrecision(ranked, g.relevant, k);
      sumR += recall;
      sumP += precision;
      console.log(
        `Q: "${g.query}"\n   정답 [${g.relevant}] / top-${k} [${ranked.slice(0, k)}]  →  Recall ${(recall * 100).toFixed(0)}%  Precision ${(precision * 100).toFixed(0)}%`
      );
    }
    const avgR = sumR / GOLDEN.length;
    const avgP = sumP / GOLDEN.length;
    const f1 = avgR + avgP === 0 ? 0 : (2 * avgR * avgP) / (avgR + avgP);
    console.log(
      `\n[평균] Recall ${(avgR * 100).toFixed(0)}%  Precision ${(avgP * 100).toFixed(0)}%  F1 ${f1.toFixed(2)}`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

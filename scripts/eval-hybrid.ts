// ===== [마일스톤4: 평가] — RAG 개선 실험 (확장 골든셋) =====
// 임베딩 단독 vs 하이브리드(키워드+임베딩)
// 골든셋을 12문제로 늘려 더 믿을 만한 "시험지"로 측정.
// 실행: npx tsx scripts/eval-hybrid.ts   (무료·로컬)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// --- 확장 corpus: 16개 대화 (테마 다양하게) ---
const CORPUS = [
  "나: 어제 연락 왜 안 받았어? / 상대: 아 바빴어 / 나: 서운하네 / 상대: 미안 다음엔 할게",        // 0 서운
  "상대: 오늘 너 생각 많이 났어ㅎㅎ / 나: 왜? / 상대: 그냥 보고싶어서 / 나: 나도!",                 // 1 호감
  "나: 점심 뭐 먹었어? / 상대: 김치찌개 / 나: 맛있겠다 / 상대: ㅇㅇ",                              // 2 잡담
  "나: 이번 주말 약속 취소됐어 / 상대: 또? 세 번째잖아 / 나: 미안해 / 상대: 좀 실망이야",           // 3 실망
  "상대: 나 이번에 이직해 / 나: 오 축하해! 어디로? / 상대: IT 회사 / 나: 잘됐다",                  // 4 무관정보
  "나: 답장이 좀 느리네? / 상대: 아 미안 요즘 정신없어 / 나: 바쁜가보다 / 상대: 응 좀",             // 5 거리두기
  "나: 우리 이번 주에 영화 볼래? / 상대: 좋아! 뭐 볼까 / 나: 겨울왕국 어때 / 상대: 콜",             // 6 데이트제안
  "상대: 먼저 연락해봤어 뭐하나 싶어서 / 나: 오 웬일 / 상대: 그냥 궁금했어 / 나: 고마워ㅎㅎ",        // 7 먼저다가옴
  "나: 우리 언제 한번 볼까? / (상대 읽고 답 없음) / 나: ...바쁜가 보다",                          // 8 읽씹
  "상대: 오늘 프로필 사진 예쁘게 나왔더라 / 나: 고마워ㅎㅎ / 상대: 실물이 더 예쁠 듯",              // 9 칭찬
  "나: 어제 누구랑 있었어? / 상대: 그냥 친구 / 나: 남자야? / 상대: 왜 그렇게 신경 써ㅋㅋ",          // 10 질투/신경전
  "상대: 저번에 말한 파스타집 갈래? / 나: 좋아 언제? / 상대: 토요일 어때",                         // 11 데이트제안2
  "나: 아까는 내가 미안했어 / 상대: 나도 미안 / 나: 우리 풀자 / 상대: 응 ㅎㅎ",                    // 12 화해
  "나: 오늘 비 온대 / 상대: 우산 챙겨 / 나: ㅇㅇ 고마워",                                        // 13 무관정보2
  "상대: 나 너 좋아하는 것 같아 / 나: 진짜? / 상대: 응 자꾸 생각나",                              // 14 고백
  "나: 너 요즘 나한테 관심 없는 것 같아 / 상대: 그런 거 아냐 / 나: 근데 왜 자꾸 이래",             // 15 불만/갈등
];

// --- 확장 골든셋: 12문제 (질문 + 정답 인덱스) ---
const GOLDEN = [
  { query: "상대가 서운해하거나 나한테 실망한 순간", relevant: [0, 3, 15] },
  { query: "상대가 나한테 호감이나 관심을 보인 순간", relevant: [1, 7, 9, 14] },
  { query: "만남이나 데이트를 제안한 대화", relevant: [6, 11] },
  { query: "상대가 나를 밀어내거나 거리를 두는 신호", relevant: [5, 8] },
  { query: "상대가 질투하거나 다른 사람 얘기로 신경전", relevant: [10] },
  { query: "싸운 뒤 화해하는 대화", relevant: [12] },
  { query: "상대가 좋아한다고 고백하거나 마음을 표현한 순간", relevant: [14] },
  { query: "연애랑 상관없는 일상이나 정보 대화", relevant: [2, 4, 13] },
  { query: "상대가 나를 칭찬한 부분", relevant: [9] },
  { query: "읽씹당하거나 답장을 못 받은 상황", relevant: [8] },
  { query: "관계에 대한 불만이나 갈등", relevant: [3, 10, 15] },
  { query: "상대가 먼저 연락하거나 다가온 경우", relevant: [7] },
];

function bigrams(s: string): string[] {
  const clean = s.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const out: string[] = [];
  for (let i = 0; i < clean.length - 1; i++) out.push(clean.slice(i, i + 2));
  return out;
}
function lexicalScore(query: string, text: string): number {
  const t = new Set(bigrams(text));
  let hit = 0;
  for (const b of new Set(bigrams(query))) if (t.has(b)) hit++;
  return hit;
}
function rankBy(scores: number[]): number[] {
  return scores.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s).map((x) => x.i);
}
function rrf(rankings: number[][], C = 60): number[] {
  const score: Record<number, number> = {};
  for (const ranking of rankings)
    ranking.forEach((doc, rank) => { score[doc] = (score[doc] ?? 0) + 1 / (C + rank + 1); });
  return Object.keys(score).map(Number).sort((a, b) => score[b] - score[a]);
}
function metrics(ranked: number[], relevant: number[], k: number) {
  const hit = ranked.slice(0, k).filter((i) => relevant.includes(i)).length;
  return { recall: hit / relevant.length, precision: hit / k };
}

async function main() {
  loadEnv();
  const { embed, cosineSimilarity } = await import("../src/lib/embeddings");

  const corpusVecs: number[][] = [];
  for (const text of CORPUS) corpusVecs.push(await embed(text, "passage"));

  const f1 = (r: number, p: number) => (r + p === 0 ? 0 : (2 * r * p) / (r + p));

  for (const K of [3, 5]) {
    let eR = 0, eP = 0, hR = 0, hP = 0;
    for (const g of GOLDEN) {
      const qVec = await embed(g.query, "query");
      const embRanked = rankBy(CORPUS.map((_, i) => cosineSimilarity(qVec, corpusVecs[i])));
      const lexRanked = rankBy(CORPUS.map((_, i) => lexicalScore(g.query, CORPUS[i])));
      const hybRanked = rrf([embRanked, lexRanked]);
      const e = metrics(embRanked, g.relevant, K);
      const h = metrics(hybRanked, g.relevant, K);
      eR += e.recall; eP += e.precision; hR += h.recall; hP += h.precision;
    }
    const n = GOLDEN.length;
    console.log(`\n===== top-${K} (문제 ${n}개) =====`);
    console.log(`임베딩    Recall ${(eR/n*100).toFixed(0)}%  Precision ${(eP/n*100).toFixed(0)}%  F1 ${f1(eR/n, eP/n).toFixed(2)}`);
    console.log(`하이브리드 Recall ${(hR/n*100).toFixed(0)}%  Precision ${(hP/n*100).toFixed(0)}%  F1 ${f1(hR/n, hP/n).toFixed(2)}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

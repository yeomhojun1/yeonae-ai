// ===== [마일스톤4: 평가] — 대규모 비교: 키워드 vs 임베딩 vs 하이브리드 =====
// 대화 ~200개, 질문 ~100개를 카테고리 템플릿으로 생성 (정답 자동 라벨).
// 실행: npx tsx scripts/eval-scale.ts   (무료·로컬, 임베딩 ~300회라 몇 분 소요)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// "{a|b|c}" 슬롯을 모든 조합으로 펼침
function expand(tpl: string): string[] {
  const segs: { lit?: string; opts?: string[] }[] = [];
  const re = /\{([^}]*)\}/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(tpl))) {
    if (m.index > last) segs.push({ lit: tpl.slice(last, m.index) });
    segs.push({ opts: m[1].split("|") });
    last = m.index + m[0].length;
  }
  if (last < tpl.length) segs.push({ lit: tpl.slice(last) });
  let out = [""];
  for (const s of segs) {
    if (s.lit !== undefined) out = out.map((r) => r + s.lit);
    else { const nx: string[] = []; for (const r of out) for (const o of s.opts!) nx.push(r + o); out = nx; }
  }
  return [...new Set(out)];
}

// 카테고리: 대화 템플릿 + 질문 템플릿 (슬롯으로 변형 생성)
const CATS = [
  { name: "서운", convo: "나: {어제|아까|방금} {연락|답장|톡} 왜 {안 받았어|씹었어|늦었어}? / 상대: {바빴어|미안 못 봤어|정신없었어} / 나: {서운하네|속상해|좀 그렇다}", q: "{상대한테 |내가 }{서운|속상|섭섭}{했던|한} {부분|순간|대화}" },
  { name: "호감", convo: "상대: {오늘|요즘|자꾸} 너 {생각났어|보고싶었어|떠올랐어} / 나: {왜|진짜|갑자기}? / 상대: 그냥 {좋아서|끌려서|설레서}", q: "상대가 {나한테 |}{호감|관심|설렘}을 {보인|드러낸|느낀} {순간|대화|부분}" },
  { name: "잡담", convo: "나: {점심|저녁|아침} 뭐 {먹었어|먹을거야}? / 상대: {김치찌개|파스타|치킨|샐러드} / 나: {맛있겠다|좋겠다|부럽다}", q: "{연애랑 상관없는 |}{일상|평범한|소소한} {잡담|대화|수다}" },
  { name: "실망", convo: "나: {주말|오늘|이번} 약속 {취소됐어|미뤄졌어} / 상대: {또?|세 번째잖아|자꾸 왜} / 상대: {실망이야|좀 그러네|서운하다}", q: "상대가 {나한테 |}{실망|기대에 못 미침|서운}{했던|한} {상황|순간|대화}" },
  { name: "정보", convo: "상대: 나 {이직해|이사가|자격증 땄어} / 나: {오 축하해|대박|잘됐다} / 상대: {IT 회사|서울로|드디어}", q: "{근황|소식|정보}를 {나눈|전한|공유한} {대화|부분}" },
  { name: "거리두기", convo: "나: {답장|연락}이 {느리네|뜸하네|줄었네}? / 상대: {미안 바빠|요즘 정신없어|여유가 없어} / 나: {그렇구나|바쁜가보다|알겠어}", q: "상대가 {나를 |}{밀어내|거리를 두|멀어지}는 {신호|느낌|대화}" },
  { name: "데이트제안", convo: "나: {이번 주|주말|다음에} {영화|밥|카페} {볼래|먹을래|갈래}? / 상대: {좋아|콜|그러자} / 상대: {언제?|어디서?|몇 시?}", q: "{만남|데이트|약속}을 {제안|신청|먼저 얘기}한 {대화|순간}" },
  { name: "먼저다가옴", convo: "상대: {먼저 연락해봤어|톡 해봤어|말 걸어봤어} / 나: {웬일|오|신기하네} / 상대: 그냥 {궁금해서|생각나서|보고싶어서}", q: "상대가 {먼저 |}{연락|다가|말 걸어}온 {경우|순간|대화}" },
  { name: "읽씹", convo: "나: {우리 언제 볼까|뭐해|답 좀}? / 상대: (읽고 {답 없음|무응답|무시}) / 나: {바쁜가보다|...|허무하다}", q: "{읽씹|답장 없|무응답}{당한|인} {상황|순간|대화}" },
  { name: "칭찬", convo: "상대: 오늘 {사진|프사|스타일} {예쁘다|잘 나왔다|멋지다} / 나: {고마워|ㅎㅎ|쑥스럽네} / 상대: {실물이 더|진짜|정말}", q: "상대가 {나를 |}{칭찬|띄워주|추켜세워}준 {부분|순간|말}" },
  { name: "질투", convo: "나: {어제|아까} 누구랑 {있었어|만났어}? / 상대: 그냥 친구 / 나: {남자야|여자야}? / 상대: 왜 {신경 써|그렇게 물어|질투해}", q: "{질투|신경전|다른 사람 얘기}{하는|가 나온} {대화|순간}" },
  { name: "화해", convo: "나: {아까|어제} {미안했어|내가 잘못했어} / 상대: 나도 미안 / 나: {풀자|화해하자|잘 지내자}", q: "{싸운 뒤 |}{화해|사과|풀}{하는|린} {대화|순간}" },
  { name: "고백", convo: "상대: 나 너 {좋아하는|사랑하는|많이 좋아하는} 것 같아 / 나: {진짜|정말}? / 상대: 응 {자꾸 생각나|끌려|설레}", q: "{좋아한다고 |마음을 }{고백|표현|드러낸} {순간|대화}" },
];

const CONVOS_PER_CAT = 16;
const QUERIES_PER_CAT = 8;

function bigrams(s: string): string[] {
  const c = s.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const o: string[] = [];
  for (let i = 0; i < c.length - 1; i++) o.push(c.slice(i, i + 2));
  return o;
}
function lexicalScore(q: string, t: string): number {
  const ts = new Set(bigrams(t));
  let h = 0;
  for (const b of new Set(bigrams(q))) if (ts.has(b)) h++;
  return h;
}
function rankBy(scores: number[]): number[] {
  return scores.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s).map((x) => x.i);
}
function rrf(rankings: number[][], C = 60): number[] {
  const sc: Record<number, number> = {};
  for (const r of rankings) r.forEach((d, rank) => { sc[d] = (sc[d] ?? 0) + 1 / (C + rank + 1); });
  return Object.keys(sc).map(Number).sort((a, b) => sc[b] - sc[a]);
}
function metrics(ranked: number[], relevant: Set<number>, k: number) {
  const hit = ranked.slice(0, k).filter((i) => relevant.has(i)).length;
  return { recall: hit / relevant.size, precision: hit / k };
}

async function main() {
  loadEnv();
  const { embed, cosineSimilarity } = await import("../src/lib/embeddings");

  // 대화 생성 (카테고리 태그 포함)
  const corpus: string[] = [];
  const corpusCat: number[] = [];
  CATS.forEach((c, ci) => {
    for (const text of expand(c.convo).slice(0, CONVOS_PER_CAT)) {
      corpus.push(text); corpusCat.push(ci);
    }
  });

  // 질문 생성 (정답 = 같은 카테고리 대화들)
  const queries: { text: string; relevant: Set<number> }[] = [];
  CATS.forEach((c, ci) => {
    const rel = new Set<number>();
    corpusCat.forEach((cat, idx) => { if (cat === ci) rel.add(idx); });
    for (const qt of expand(c.q).slice(0, QUERIES_PER_CAT)) queries.push({ text: qt, relevant: rel });
  });

  console.log(`대화 ${corpus.length}개 / 질문 ${queries.length}개 생성. 임베딩 중...`);
  const corpusVecs: number[][] = [];
  for (const t of corpus) corpusVecs.push(await embed(t, "passage"));

  const f1 = (r: number, p: number) => (r + p === 0 ? 0 : (2 * r * p) / (r + p));
  const K = 5;
  const acc = { kw: { r: 0, p: 0 }, emb: { r: 0, p: 0 }, hyb: { r: 0, p: 0 } };

  for (const q of queries) {
    const qVec = await embed(q.text, "query");
    const embRanked = rankBy(corpus.map((_, i) => cosineSimilarity(qVec, corpusVecs[i])));
    const kwRanked = rankBy(corpus.map((_, i) => lexicalScore(q.text, corpus[i])));
    const hybRanked = rrf([embRanked, kwRanked]);
    const e = metrics(embRanked, q.relevant, K);
    const k = metrics(kwRanked, q.relevant, K);
    const h = metrics(hybRanked, q.relevant, K);
    acc.emb.r += e.recall; acc.emb.p += e.precision;
    acc.kw.r += k.recall; acc.kw.p += k.precision;
    acc.hyb.r += h.recall; acc.hyb.p += h.precision;
  }
  const n = queries.length;
  console.log(`\n===== top-${K} 평균 (질문 ${n}개, 대화 ${corpus.length}개) =====`);
  for (const [name, a] of [["키워드", acc.kw], ["임베딩", acc.emb], ["하이브리드", acc.hyb]] as const) {
    console.log(`${name.padEnd(5)}  Recall ${(a.r / n * 100).toFixed(0)}%  Precision ${(a.p / n * 100).toFixed(0)}%  F1 ${f1(a.r / n, a.p / n).toFixed(2)}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

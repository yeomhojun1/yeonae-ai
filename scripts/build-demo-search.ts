// 데모 모드용 검색 결과를 미리 계산해 JSON으로 저장한다.
// 실서비스 /search 와 같은 청킹(chunk.ts)·로컬 임베딩 모델(embeddings.ts, multilingual-e5-small)로
// 샘플 대화(src/lib/demo/samples.ts)를 색인하고, 준비된 검색어마다 코사인 유사도 상위 k개를 기록한다.
// DB·외부 API를 쓰지 않는다(모델은 로컬 캐시에서 실행).
//
// 실행: npx tsx scripts/build-demo-search.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chunkConversation } from "../src/lib/chunk";
import { embed, embedBatch, cosineSimilarity } from "../src/lib/embeddings";
import { DEMO_SAMPLES } from "../src/lib/demo/samples";

const K = 3;
// 샘플 대화가 짧아(대화당 500자 미만) 실서비스 기본값(500자)으로 자르면 대화 하나가 조각 하나가 된다.
// 그러면 검색이 "대화 4개 중 고르기"가 되어 의미가 없으므로, 데모에서는 조각 크기만 줄여서 색인한다.
const CHUNK_MAX_CHARS = 120;
const QUERIES = [
  "서운했던 순간",
  "읽씹당한 패턴",
  "데이트 약속 잡기",
  "단답으로만 대답할 때",
  "상대가 먼저 만나자고 한 대화",
];

async function main() {
  const chunks = DEMO_SAMPLES.flatMap((s) =>
    chunkConversation(s.rawText, { maxChars: CHUNK_MAX_CHARS }).map((c) => ({
      chunkId: `${s.id}#${c.index}`,
      sessionId: s.id,
      sessionTitle: s.title,
      text: c.text,
    }))
  );
  const vecs = await embedBatch(
    chunks.map((c) => c.text),
    "passage"
  );

  const results = [];
  for (const query of QUERIES) {
    const q = await embed(query, "query");
    const hits = chunks
      .map((c, i) => ({ ...c, score: Number(cosineSimilarity(q, vecs[i]).toFixed(4)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, K);
    results.push({ query, hits });
  }

  const out = {
    model: "Xenova/multilingual-e5-small",
    k: K,
    chunkMaxChars: CHUNK_MAX_CHARS,
    chunkCount: chunks.length,
    results,
  };
  const path = join(__dirname, "..", "src", "lib", "demo", "search-results.json");
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`saved ${path} (chunks=${chunks.length})`);
  for (const r of results) {
    console.log(`\n[${r.query}]`);
    for (const h of r.hits) console.log(`  ${h.score}  ${h.chunkId}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

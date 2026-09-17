// 임베딩/유사도 테스트.
// 임베딩 모델은 로컬(@xenova, node_modules 캐시)에서 돌아가므로 API 키·과금·DB가 없다.
import test from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, embed, EMBEDDING_DIM } from "../src/lib/embeddings";

test("cosineSimilarity: 같은 벡터=1, 직교=0, 반대=-1", () => {
  const a = [1, 0, 0];
  const b = [0, 1, 0];
  const c = [-1, 0, 0];

  assert.ok(Math.abs(cosineSimilarity(a, a) - 1) < 1e-9);
  assert.ok(Math.abs(cosineSimilarity(a, b) - 0) < 1e-9);
  assert.ok(Math.abs(cosineSimilarity(a, c) + 1) < 1e-9);
});

test("cosineSimilarity는 크기가 아니라 방향만 본다", () => {
  const a = [3, 4];
  const scaled = [30, 40];
  assert.ok(Math.abs(cosineSimilarity(a, scaled) - 1) < 1e-9);
});

test("embed()는 EMBEDDING_DIM(384)차원의 단위벡터를 만든다", { timeout: 120_000 }, async () => {
  assert.equal(EMBEDDING_DIM, 384);

  const vec = await embed("오늘 대화 어땠어?", "query");
  assert.equal(vec.length, EMBEDDING_DIM);
  assert.ok(vec.every((n) => Number.isFinite(n)), "NaN/Infinity가 없어야 한다");

  const norm = Math.sqrt(vec.reduce((s, n) => s + n * n, 0));
  assert.ok(Math.abs(norm - 1) < 1e-3, `L2 norm이 1이어야 하는데 ${norm}`);
});

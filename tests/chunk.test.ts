// chunkConversation 단위 테스트 (순수 로직 — API 키·DB 불필요)
import test from "node:test";
import assert from "node:assert/strict";
import { chunkConversation } from "../src/lib/chunk";

test("빈 입력이면 조각이 없다", () => {
  assert.deepEqual(chunkConversation(""), []);
  assert.deepEqual(chunkConversation("   \n\n  \n"), []);
});

test("모든 조각이 maxChars를 넘지 않고 index가 0부터 연속이다", () => {
  const raw = Array.from({ length: 40 }, (_, i) => `나: ${i} 오늘 대화 내용입니다`).join("\n");
  const chunks = chunkConversation(raw, { maxChars: 120 });

  assert.ok(chunks.length > 1, "여러 조각으로 나뉘어야 한다");
  chunks.forEach((c, i) => {
    assert.equal(c.index, i);
    assert.ok(c.text.length <= 120, `조각 ${i} 길이 ${c.text.length} > 120`);
  });
});

test("다음 조각은 직전 조각의 마지막 overlapLines 줄로 시작한다", () => {
  const lines = Array.from({ length: 12 }, (_, i) => `line-${i}-0123456789`);
  const chunks = chunkConversation(lines.join("\n"), { maxChars: 60, overlapLines: 1 });

  assert.ok(chunks.length >= 2);
  for (let i = 1; i < chunks.length; i++) {
    const prevLines = chunks[i - 1].text.split("\n");
    const currLines = chunks[i].text.split("\n");
    assert.equal(currLines[0], prevLines[prevLines.length - 1]);
  }
});

test("overlapLines가 0이면 겹침 없이 잘린다", () => {
  const lines = Array.from({ length: 12 }, (_, i) => `line-${i}-0123456789`);
  const chunks = chunkConversation(lines.join("\n"), { maxChars: 60, overlapLines: 0 });

  const joined = chunks.map((c) => c.text).join("\n").split("\n");
  assert.equal(joined.length, lines.length, "겹침이 없으면 총 줄 수가 보존된다");
});

test("한 줄이 maxChars보다 길면 그 줄만으로 조각을 만든다", () => {
  const long = "가".repeat(700);
  const chunks = chunkConversation(long);

  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].text, long);
});

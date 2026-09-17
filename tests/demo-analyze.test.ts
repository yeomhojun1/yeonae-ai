// /api/demo-analyze 입력 검증 테스트.
// 이 라우트는 Anthropic도 DB도 쓰지 않고 고정 샘플만 돌려주므로 과금·쓰기가 없다.
import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/demo-analyze/route";
import type { StoredSession } from "../src/lib/types";

// claude.ts의 ANALYSIS_SCHEMA가 강제하는 enum (샘플이 여기서 벗어나면 안 됨)
const INTEREST_LEVELS = ["매우 높음", "높음", "보통", "낮음", "매우 낮음"];

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/demo-analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("대화가 10자 미만이면 400", async () => {
  const res = await POST(jsonRequest({ rawText: "짧음" }));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /10자 이상/);
});

test("본문이 없거나 JSON이 깨졌으면 400", async () => {
  assert.equal((await POST(jsonRequest({}))).status, 400);
  assert.equal((await POST(jsonRequest("{not json"))).status, 400);
});

test("10자 이상이면 200과 샘플 결과를 돌려준다", async () => {
  const rawText = "나: 오늘 뭐해?\n상대: 그냥 쉬고 있어ㅎㅎ";
  const res = await POST(jsonRequest({ rawText, title: "테스트" }));

  assert.equal(res.status, 200);
  const data = (await res.json()) as StoredSession;
  assert.equal(data.id, "demo");
  assert.equal(data.title, "테스트");
  assert.equal(data.rawText, rawText);
  assert.equal(data.score, data.result.score);
  assert.equal(data.result.replySuggestions.length, 3);
});

// --- 회귀: 보고서 문제 #3 (샘플 interestLevel이 스키마 enum 밖의 값) ---
test("#3 회귀: 샘플의 interestLevel이 스키마 enum 안의 값이다", async () => {
  const res = await POST(jsonRequest({ rawText: "나: 안녕 오늘 뭐해?" }));
  const data = (await res.json()) as StoredSession;

  assert.ok(
    INTEREST_LEVELS.includes(data.result.interestLevel),
    `enum 밖의 값: ${data.result.interestLevel}`
  );
});

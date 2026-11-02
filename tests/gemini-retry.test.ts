// Gemini 일시 오류 재시도·대체 모델 전환 테스트. fetch를 모킹하므로 실제 호출(과금)은 없다.
import test from "node:test";
import assert from "node:assert/strict";
import { analyzeConversation } from "../src/lib/claude";

const OK_RESULT = {
  score: 60,
  interestLevel: "보통",
  summary: "요약",
  signals: [],
  replySuggestions: [],
  nextActions: [],
};

function geminiResponse(status: number) {
  const body =
    status === 200
      ? { candidates: [{ content: { parts: [{ text: JSON.stringify(OK_RESULT) }] } }] }
      : { error: { message: `HTTP ${status} 테스트 오류` } };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** 상태 코드 목록을 순서대로 돌려주는 fetch 모킹. 호출된 URL을 기록한다. */
function mockFetch(t: test.TestContext, statuses: number[]) {
  const prevKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  t.after(() => {
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  });
  const urls: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: unknown) => {
    urls.push(String(url));
    return geminiResponse(statuses[urls.length - 1] ?? 200);
  });
  return urls;
}

const RAW = "나: 오늘 뭐해?\n상대: 그냥 쉬고 있어ㅎㅎ";

test("과부하(503)가 이어지면 대체 모델로 넘어가 결과를 받는다", async (t) => {
  const urls = mockFetch(t, [503, 503, 200]);
  const result = await analyzeConversation(RAW);

  assert.equal(result.score, 60);
  assert.equal(urls.length, 3);
  assert.match(urls[0], /gemini-3\.5-flash:/);
  assert.match(urls[1], /gemini-3\.5-flash:/);
  assert.match(urls[2], /gemini-2\.5-flash:/);
});

test("일시 오류가 아니면(400) 재시도하지 않고 바로 실패한다", async (t) => {
  const urls = mockFetch(t, [400]);
  await assert.rejects(analyzeConversation(RAW), /HTTP 400/);
  assert.equal(urls.length, 1);
});

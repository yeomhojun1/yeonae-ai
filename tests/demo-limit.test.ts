// /api/demo-analyze 서버 쪽 호출 제한 테스트.
// GEMINI_API_KEY가 없으면 목업 결과로 동작하므로 실제 AI 호출(과금)은 없다.
import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/demo-analyze/route";
import { clientIp, resetDemoLimits } from "../src/lib/demo-limit";

const RAW = "나: 오늘 뭐해?\n상대: 그냥 쉬고 있어ㅎㅎ";

function demoRequest(ip: string, rawText = RAW): Request {
  return new Request("http://localhost/api/demo-analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ rawText }),
  });
}

test.beforeEach(() => {
  resetDemoLimits();
  delete process.env.DEMO_GLOBAL_DAILY_LIMIT;
});

test("같은 IP는 하루 3회까지, 4번째는 429", async () => {
  for (let i = 0; i < 3; i++) {
    assert.equal((await POST(demoRequest("1.1.1.1"))).status, 200);
  }
  const res = await POST(demoRequest("1.1.1.1"));
  assert.equal(res.status, 429);
  assert.match((await res.json()).error, /하루 3회/);

  // 다른 IP는 영향 없음
  assert.equal((await POST(demoRequest("2.2.2.2"))).status, 200);
});

test("입력 검증에 걸린 요청(400)은 횟수를 쓰지 않는다", async () => {
  for (let i = 0; i < 5; i++) {
    assert.equal((await POST(demoRequest("3.3.3.3", "짧음"))).status, 400);
  }
  assert.equal((await POST(demoRequest("3.3.3.3"))).status, 200);
});

test("서비스 전체 하루 상한을 넘으면 IP가 달라도 429", async () => {
  process.env.DEMO_GLOBAL_DAILY_LIMIT = "2";
  assert.equal((await POST(demoRequest("4.4.4.1"))).status, 200);
  assert.equal((await POST(demoRequest("4.4.4.2"))).status, 200);
  const res = await POST(demoRequest("4.4.4.3"));
  assert.equal(res.status, 429);
  assert.match((await res.json()).error, /모두 소진/);
});

test("AI 호출이 실패하면(502) 횟수를 돌려준다", async (t) => {
  const prevKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  t.after(() => {
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  });
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ error: { message: "bad key" } }), { status: 400 })
  );

  for (let i = 0; i < 4; i++) {
    assert.equal((await POST(demoRequest("5.5.5.5"))).status, 502);
  }
  // 실패한 4번은 횟수에 들어가지 않았으므로 아직 429가 아니다
  t.mock.restoreAll();
  delete process.env.GEMINI_API_KEY;
  assert.equal((await POST(demoRequest("5.5.5.5"))).status, 200);
});

test("clientIp: x-forwarded-for의 첫 값, 없으면 x-real-ip", () => {
  const h = (headers: Record<string, string>) =>
    new Request("http://localhost/", { headers });
  assert.equal(clientIp(h({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" })), "9.9.9.9");
  assert.equal(clientIp(h({ "x-real-ip": "8.8.8.8" })), "8.8.8.8");
  assert.equal(clientIp(h({})), "unknown");
});

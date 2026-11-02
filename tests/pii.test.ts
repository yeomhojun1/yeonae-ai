// maskPII 단위 테스트 + Gemini로 나가는 본문에 원문 개인정보가 없는지 확인하는 통합 테스트.
// fetch를 모킹하므로 실제 API 호출(과금)은 없다.
import test from "node:test";
import assert from "node:assert/strict";
import { maskPII } from "../src/lib/pii";
import { analyzeConversation } from "../src/lib/claude";

test("주민번호를 가린다(하이픈 있음/없음)", () => {
  const r = maskPII("내 주민번호 990101-1234567 이고 동생은 0503154123456");
  assert.equal(r.text, "내 주민번호 [주민번호] 이고 동생은 [주민번호]");
  assert.equal(r.counts.주민번호, 2);
});

test("카드번호를 가린다", () => {
  const r = maskPII("카드 1234-5678-9012-3456 이걸로 결제해, 아멕스는 3714 496353 98431");
  assert.equal(r.text, "카드 [카드번호] 이걸로 결제해, 아멕스는 [카드번호]");
  assert.equal(r.counts.카드번호, 2);
});

test("휴대폰(010·+82)과 유선전화를 가린다", () => {
  const r = maskPII(
    "내 번호 010-1234-5678, 붙여서 01098765432, 해외에선 +82 10-1111-2222, 집 02-123-4567, 회사 031)987-6543"
  );
  assert.equal(
    r.text,
    "내 번호 [전화번호], 붙여서 [전화번호], 해외에선 [전화번호], 집 [전화번호], 회사 [전화번호]"
  );
  assert.equal(r.counts.전화번호, 5);
});

test("이메일을 가린다(앞부분이 전화번호여도 통째로)", () => {
  const r = maskPII("메일은 minji.kim+date@gmail.com 이나 01012345678@naver.com 으로");
  assert.equal(r.text, "메일은 [이메일] 이나 [이메일] 으로");
  assert.equal(r.counts.이메일, 2);
  assert.equal(r.counts.전화번호, undefined);
});

test("계좌번호를 가린다(하이픈 형식 + 붙여 쓴 10~14자리)", () => {
  const r = maskPII("신한 110-123-456789 로 보내줘. 국민은 12345678901234");
  assert.equal(r.text, "신한 [계좌번호] 로 보내줘. 국민은 [계좌번호]");
  assert.equal(r.counts.계좌번호, 2);
});

test("시·구가 붙은 도로명 주소를 가린다", () => {
  const r = maskPII(
    "우리 집 서울시 강남구 테헤란로 123 이야. 회사는 경기 성남시 분당구 판교역로 235, 친구는 부산광역시 해운대구 해운대해변로 30-1"
  );
  assert.equal(r.text, "우리 집 [주소] 이야. 회사는 [주소], 친구는 [주소]");
  assert.equal(r.counts.주소, 3);
});

test("동·호수를 가린다", () => {
  const r = maskPII("101동 1203호로 와. 택배는 5 동 302 호에 맡겨줘");
  assert.equal(r.text, "[주소]로 와. 택배는 [주소]에 맡겨줘");
  assert.equal(r.counts.주소, 2);
});

test("오탐 방지: 날짜·시간·금액·이름은 그대로 둔다", () => {
  const raw = [
    "민지: 2026-11-02에 볼까? 2026.11.02도 괜찮고",
    "나: 그걸로 3시에 강남역에서 봐 14:30도 돼",
    "민지: 밥값 35,000원 나왔어 1,200,000원짜리 가방은 무리ㅋㅋ",
    "나: 지하철 2호선 타고 갈게, 20261102 기념일이야",
  ].join("\n");
  const r = maskPII(raw);
  assert.equal(r.text, raw);
  assert.deepEqual(r.counts, {});
});

test("통합: Gemini로 나가는 본문에 원문 개인정보가 없다", async (t) => {
  const prevKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  t.after(() => {
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  });

  let sentBody = "";
  t.mock.method(globalThis, "fetch", async (_url: unknown, init?: { body?: string }) => {
    sentBody = String(init?.body ?? "");
    const result = {
      score: 70,
      interestLevel: "높음",
      summary: "요약",
      signals: [],
      replySuggestions: [],
      nextActions: [],
    };
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(result) }] } }] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  });

  const secrets = ["010-1234-5678", "minji@gmail.com", "110-123-456789", "테헤란로 123", "990101-1234567"];
  const raw = `민지: 내 번호 ${secrets[0]}, 메일 ${secrets[1]}\n나: 입금은 ${secrets[2]}로 할게\n민지: 서울시 강남구 ${secrets[3]}로 와`;
  const result = await analyzeConversation(raw, `소개팅 상대, 주민번호 ${secrets[4]} 알려줌`);

  assert.equal(result.score, 70);
  assert.ok(sentBody.length > 0, "fetch가 호출되지 않았다");
  for (const s of secrets) {
    assert.ok(!sentBody.includes(s), `원문 개인정보가 전송됨: ${s}`);
  }
  assert.ok(sentBody.includes("민지"), "이름(화자)은 가리지 않아야 한다");
  assert.ok(sentBody.includes("[전화번호]"));
});

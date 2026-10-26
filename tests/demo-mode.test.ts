// 정적 데모 모드(src/lib/demo) 테스트. AI·DB를 쓰지 않는다.
import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_SAMPLES,
  DEMO_QUERIES,
  DEMO_ONLY_SAMPLE_MESSAGE,
  demoAnalyze,
  demoSearch,
} from "../src/lib/demo";

// claude.ts ANALYSIS_SCHEMA 의 enum
const INTEREST_LEVELS = ["매우 높음", "높음", "보통", "낮음", "매우 낮음"];
const SIGNAL_TYPES = ["positive", "negative", "neutral"];

test("샘플 결과가 실서비스 분석 스키마를 따른다", () => {
  for (const s of DEMO_SAMPLES) {
    const r = s.result;
    assert.ok(Number.isInteger(r.score) && r.score >= 0 && r.score <= 100, s.id);
    assert.equal(s.score, r.score, s.id);
    assert.ok(INTEREST_LEVELS.includes(r.interestLevel), s.id);
    assert.ok(r.summary.length > 0, s.id);
    assert.ok(r.signals.every((x) => SIGNAL_TYPES.includes(x.type) && x.text), s.id);
    assert.equal(r.replySuggestions.length, 3, s.id);
    assert.ok(r.nextActions.length >= 2 && r.nextActions.length <= 4, s.id);
  }
});

test("샘플 대화는 결과를 돌려주고, 줄바꿈·공백 차이는 무시한다", () => {
  const s = DEMO_SAMPLES[1];
  const out = demoAnalyze({ rawText: s.rawText.replace(/\n/g, "  \r\n\r\n") });
  assert.ok(out.ok);
  if (out.ok) assert.equal(out.data.id, s.id);
});

test("샘플이 아닌 대화는 안내 문구로 거절한다", () => {
  const out = demoAnalyze({ rawText: "나: 안녕 오늘 뭐해?\n상대: 그냥 쉬어" });
  assert.deepEqual(out, { ok: false, error: DEMO_ONLY_SAMPLE_MESSAGE });
});

test("준비된 검색어는 샘플 세션을 가리키는 결과를 돌려준다", () => {
  const ids = new Set(DEMO_SAMPLES.map((s) => s.id));
  assert.ok(DEMO_QUERIES.length > 0);
  for (const q of DEMO_QUERIES) {
    const out = demoSearch(q);
    assert.ok(out.ok, q);
    if (out.ok) {
      assert.ok(out.data.length > 0, q);
      assert.ok(out.data.every((h) => ids.has(h.sessionId)), q);
    }
  }
  assert.equal(demoSearch("준비 안 된 검색어").ok, false);
});

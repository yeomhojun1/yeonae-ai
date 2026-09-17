// parseKakaoExport 단위 테스트 (순수 로직 — API 키·DB 불필요)
import test from "node:test";
import assert from "node:assert/strict";
import { parseKakaoExport } from "../src/lib/kakao";

test("iOS/PC 형식([이름] [시각] 메시지)을 '이름: 메시지'로 정규화한다", () => {
  const raw = [
    "홍길동님과 카카오톡 대화",
    "저장한 날짜 : 2024-01-01 15:00:00",
    "",
    "--------------- 2024년 1월 1일 월요일 ---------------",
    "[홍길동] [오후 3:00] 오늘 뭐해?",
    "[나] [오후 3:01] 그냥 있어",
  ].join("\n");

  assert.equal(parseKakaoExport(raw), "홍길동: 오늘 뭐해?\n나: 그냥 있어");
});

test("안드로이드 형식(날짜, 이름 : 메시지)을 '이름: 메시지'로 정규화한다", () => {
  const raw = [
    "홍길동님과 카카오톡 대화",
    "저장한 날짜 : 2024. 1. 1. 오후 3:00",
    "",
    "2024년 1월 1일 오후 3:00, 홍길동 : 안녕!",
    "2024. 1. 1. 오후 3:05, 나 : 응 안녕",
  ].join("\n");

  assert.equal(parseKakaoExport(raw), "홍길동: 안녕!\n나: 응 안녕");
});

test("카톡 형식이 전혀 없으면 원문을 그대로 돌려준다", () => {
  const raw = "나: 오늘 뭐해?\n상대: 그냥 있어";
  assert.equal(parseKakaoExport(raw), raw);
});

// --- 회귀: 보고서 문제 #8 (HEADER_RE 과탐) ---
test("#8 회귀: 헤더 어구가 메시지 '본문 안'에 있어도 그 줄을 지우지 않는다", () => {
  const raw = [
    "홍길동님과 카카오톡 대화",
    "저장한 날짜 : 2024-01-01 15:00:00",
    "[홍길동] [오후 3:00] 그 사진 저장한 날짜 기억나?",
    "[나] [오후 3:01] 아니 기억 안 나",
  ].join("\n");

  const out = parseKakaoExport(raw);
  assert.equal(out, "홍길동: 그 사진 저장한 날짜 기억나?\n나: 아니 기억 안 나");
  assert.ok(out.includes("저장한 날짜 기억나?"));
});

test("#8 회귀: 파일 앞부분을 벗어난 위치의 헤더 어구 줄은 메시지로 보존한다", () => {
  const lines = [
    "홍길동님과 카카오톡 대화",
    "저장한 날짜 : 2024-01-01 15:00:00",
    "[홍길동] [오후 3:00] 1",
    "[나] [오후 3:01] 2",
    "[홍길동] [오후 3:02] 3",
    "[나] [오후 3:03] 4",
    "저장한 날짜가 언제였더라", // 멀티라인 메시지의 뒷줄 (index 6 > 스캔 범위)
  ];

  const out = parseKakaoExport(lines.join("\n"));
  assert.ok(out.includes("저장한 날짜가 언제였더라"));
  // 반대로 파일 맨 앞의 진짜 헤더는 여전히 제거된다
  assert.ok(!out.includes("저장한 날짜 : 2024-01-01"));
  assert.ok(!out.includes("님과 카카오톡 대화"));
});

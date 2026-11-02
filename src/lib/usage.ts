// 무료 사용량 관련 상수/유틸 (analyze API와 마이페이지에서 공유)

// 무료 하루 분석 횟수 제한 (사용자 1인 기준)
export const FREE_DAILY_LIMIT = 3;

// 비로그인 데모 분석이 받는 대화 최대 길이 (무료 키 토큰 절약). 로그인 분석은 12,000자.
export const DEMO_MAX_CHARS = 8000;

// Asia/Seoul 기준 "YYYY-MM-DD" (하루 한도의 일자 키).
// en-CA 로케일은 YYYY-MM-DD 형식을 준다.
export function seoulDayKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date()
  );
}

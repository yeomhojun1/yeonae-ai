// 개인정보(PII) 마스킹: 외부 LLM(Gemini 무료 등급 등)으로 대화를 보내기 전에
// 한국형 개인정보를 [전화번호] 같은 표시로 바꾼다. 무료 등급 API는 입력을 학습에 쓸 수 있다.
// 이름은 가리지 않는다(화자 구분이 분석의 핵심).

export type PIIType = "주민번호" | "카드번호" | "이메일" | "전화번호" | "계좌번호" | "주소";

export interface MaskResult {
  text: string;
  /** 종류별로 가린 개수 */
  counts: Partial<Record<PIIType, number>>;
}

interface Rule {
  type: PIIType;
  pattern: RegExp;
  /** 매치를 실제로 가릴지 추가 판단 (예: 숫자 개수) */
  accept?: (match: string) => boolean;
}

const digitCount = (s: string) => s.replace(/\D/g, "").length;

// 광역 지자체 약칭 ("서울 강남구 ..."처럼 '시'를 생략하는 경우)
const METRO =
  "서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주";
const CITY = `(?:[가-힣]{2,}(?:특별시|광역시|특별자치시|특별자치도|시|도)|${METRO})`;
const DISTRICT = "[가-힣]+(?:구|군|시)";

// 구체적인 형식부터 처리한다. 앞 규칙이 가린 자리는 뒤 규칙에 다시 걸리지 않는다.
const RULES: Rule[] = [
  {
    // 생년월일(YYMMDD) + 성별 자리(1~8) + 6자리
    type: "주민번호",
    pattern: /(?<!\d)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[-\s]?[1-8]\d{6}(?!\d)/g,
  },
  {
    type: "카드번호",
    pattern: /(?<!\d)(?:\d{4}[-\s]?){3}\d{4}(?!\d)|(?<!\d)\d{4}[-\s]?\d{6}[-\s]?\d{5}(?!\d)/g,
  },
  {
    // 이메일 앞부분에 전화번호가 들어간 경우(01012345678@...)를 통째로 가리려고 전화보다 먼저
    type: "이메일",
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    // 휴대폰: 010-1234-5678, 01012345678, +82 10-1234-5678
    type: "전화번호",
    pattern: /(?<![\d+])(?:\+82[-\s]?0?|0)1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}(?!\d)/g,
  },
  {
    // 유선: 02-123-4567, 031)123-4567, +82 2-123-4567 (마지막 4자리 앞 구분자 필수)
    type: "전화번호",
    pattern: /(?<![\d+])(?:\+82[-\s]?|0)(?:2|[3-6][1-5])[-\s.)]?\d{3,4}[-\s.]\d{4}(?!\d)/g,
  },
  {
    // 하이픈 계좌: 110-123-456789, 1002-123-456789 (숫자 10~14자리일 때만; 날짜 2026-11-02는 제외)
    type: "계좌번호",
    pattern: /(?<!\d)\d{2,6}-\d{2,6}-\d{2,7}(?:-\d{1,3})?(?!\d)/g,
    accept: (m) => {
      const n = digitCount(m);
      return n >= 10 && n <= 14;
    },
  },
  {
    // 붙여 쓴 계좌: 10~14자리 연속 숫자
    type: "계좌번호",
    pattern: /(?<!\d)\d{10,14}(?!\d)/g,
  },
  {
    // 시·구가 붙은 도로명 주소: 서울시 강남구 테헤란로 123, 경기 성남시 분당구 판교역로 235
    type: "주소",
    pattern: new RegExp(
      `${CITY}\\s+(?:${DISTRICT}\\s+){1,2}(?:[가-힣]+(?:읍|면|동)\\s+)?[가-힣0-9]+(?:로|길)\\s*\\d+(?:-\\d+)?`,
      "g"
    ),
  },
  {
    // 동·호수: 101동 1203호
    type: "주소",
    pattern: /(?<!\d)\d{1,4}\s*동\s*\d{1,5}\s*호(?!선)/g,
  },
];

/** 텍스트의 개인정보를 [종류] 표시로 바꾸고, 종류별로 가린 개수를 함께 돌려준다. */
export function maskPII(text: string): MaskResult {
  const counts: MaskResult["counts"] = {};
  let out = text;
  for (const rule of RULES) {
    out = out.replace(rule.pattern, (m) => {
      if (rule.accept && !rule.accept(m)) return m;
      counts[rule.type] = (counts[rule.type] ?? 0) + 1;
      return `[${rule.type}]`;
    });
  }
  return { text: out, counts };
}

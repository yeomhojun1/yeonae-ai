// 카카오톡 "대화 내보내기(.txt)" 파일을 분석하기 좋은 형태로 정리한다.
// 여러 내보내기 형식을 지원하고, 알아보지 못한 줄은 원문 그대로 남겨 정보 손실을 막는다.

// iOS / PC 형식:  [홍길동] [오후 3:00] 메시지
const BRACKET_RE = /^\[(?<name>.+?)\]\s*\[(?<time>[^\]]+)\]\s*(?<msg>.*)$/;

// 안드로이드 형식:  2024년 1월 1일 오후 3:00, 홍길동 : 메시지
//                  2024. 1. 1. 오후 3:00, 홍길동 : 메시지
const DATED_RE =
  /^\d{4}[.\s년].*?(?:오전|오후)\s*\d{1,2}:\d{2},\s*(?<name>.+?)\s*:\s*(?<msg>.*)$/;

// 날짜 구분선:  --------------- 2024년 1월 1일 월요일 ---------------
const DATE_DIVIDER_RE = /^-{3,}.*-{3,}$/;

// 내보내기 헤더로 무시할 줄. 줄 시작에 앵커를 걸고(본문 중간에 같은 어구가 있어도 안전),
// 헤더가 실제로 나타나는 파일 맨 앞부분에서만 판정한다.
const HEADER_RE = /^(?:.{0,40}님과 카카오톡 대화|저장한 날짜|저장한 대화)/;
const HEADER_SCAN_LINES = 5;

/**
 * 카톡 내보내기 텍스트를 "이름: 메시지" 줄들로 정리.
 * 카톡 형식이 전혀 감지되지 않으면(일반 붙여넣기) 원문을 그대로 돌려준다.
 */
export function parseKakaoExport(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let matched = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    if (
      DATE_DIVIDER_RE.test(trimmed) ||
      (i < HEADER_SCAN_LINES && HEADER_RE.test(trimmed))
    ) {
      continue; // 구분선/헤더 제거
    }

    const m = BRACKET_RE.exec(trimmed) ?? DATED_RE.exec(trimmed);
    if (m?.groups) {
      matched++;
      out.push(`${m.groups.name.trim()}: ${m.groups.msg.trim()}`);
    } else {
      // 메시지 줄바꿈(멀티라인)일 수 있으니 원문 유지
      out.push(trimmed);
    }
  }

  // 카톡 형식이 하나도 없으면 사용자가 직접 정리해 붙여넣은 것으로 보고 원문 유지
  if (matched === 0) return raw.trim();

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

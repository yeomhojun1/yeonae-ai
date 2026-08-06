// ===== [마일스톤1: 청킹·임베딩·저장] — 이 파일 = 청킹(Chunking) =====
// 대화 원문을 검색·저장하기 좋은 "조각"으로 자른다. (RAG 파이프라인의 첫 단계)
//
// 원칙 (Phase 2에서 배운 것):
//  - 너무 작으면 맥락이 끊기고, 너무 크면 잡음이 섞인다 → 균형점.
//  - 대화는 줄(턴) 단위 의미가 있으므로 줄 경계로 자른다.
//  - 조각 경계에서 맥락이 끊기지 않게 겹침(overlap)을 준다.

export interface Chunk {
  index: number;
  text: string;
}

export interface ChunkOptions {
  /** 한 조각의 목표 최대 글자 수 */
  maxChars?: number;
  /** 다음 조각 앞에 겹쳐 넣을 줄 수 (맥락 유지) */
  overlapLines?: number;
}

/**
 * 대화 원문을 줄 단위로 모아 조각으로 만든다.
 * 각 조각은 maxChars를 넘지 않는 선에서 여러 줄을 담고,
 * 다음 조각은 직전 조각의 마지막 overlapLines 줄을 앞에 겹쳐서 시작한다.
 */
export function chunkConversation(
  rawText: string,
  { maxChars = 500, overlapLines = 1 }: ChunkOptions = {}
): Chunk[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const chunks: Chunk[] = [];
  let current: string[] = [];
  let currentLen = 0;

  const flush = () => {
    if (current.length === 0) return;
    chunks.push({ index: chunks.length, text: current.join("\n") });
    // 겹침: 마지막 overlapLines 줄을 다음 조각의 시작으로 이월
    const carry = overlapLines > 0 ? current.slice(-overlapLines) : [];
    current = [...carry];
    currentLen = carry.reduce((n, l) => n + l.length + 1, 0);
  };

  for (const line of lines) {
    // 한 줄이 이미 maxChars보다 길면 그 줄만으로 조각을 만든다
    if (line.length >= maxChars) {
      flush();
      chunks.push({ index: chunks.length, text: line });
      current = [];
      currentLen = 0;
      continue;
    }
    // 현재 조각에 더 넣으면 최대치를 넘는 경우 → 먼저 비운다
    if (currentLen + line.length + 1 > maxChars && current.length > 0) {
      flush();
    }
    current.push(line);
    currentLen += line.length + 1;
  }
  flush();

  return chunks;
}

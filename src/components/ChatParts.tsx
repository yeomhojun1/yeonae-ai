// 카톡 대화 화면 조각: 첫 화면 미리보기와 분석 결과(답장 추천)가 함께 쓴다.

/** 상대가 보낸 말풍선 */
export function TheirBubble({ children, time }: { children: React.ReactNode; time?: string }) {
  return (
    <div className="flex items-end gap-1">
      <p className="max-w-[80%] rounded-2xl rounded-tl-[4px] bg-white px-3 py-2 text-[14px] leading-5 text-ink-900 shadow-card">
        {children}
      </p>
      {time && <span className="shrink-0 text-[11px] text-ink-500">{time}</span>}
    </div>
  );
}

/** 내가 보낼(보낸) 말풍선. 옆의 노란 "1"은 카톡의 안 읽음 표시 */
export function MyBubble({
  children,
  time,
  unread = true,
}: {
  children: React.ReactNode;
  time?: string;
  unread?: boolean;
}) {
  return (
    <div className="flex items-end justify-end gap-1">
      <span className="flex shrink-0 flex-col items-end text-[11px] leading-4">
        {unread && <span className="font-semibold text-unread">1</span>}
        {time && <span className="text-ink-500">{time}</span>}
      </span>
      <p className="max-w-[80%] rounded-2xl rounded-tr-[4px] bg-butter px-3 py-2 text-[14px] leading-5 text-ink-900">
        {children}
      </p>
    </div>
  );
}

/** 0~100 점수 링. 포인트 색 하나로 채운다 */
export function ScoreRing({ score, size = 120, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-ink-100" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-brand-500 transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums text-ink-900"
        style={{ fontSize: Math.round(size * 0.28) }}
      >
        {score}
      </span>
    </div>
  );
}

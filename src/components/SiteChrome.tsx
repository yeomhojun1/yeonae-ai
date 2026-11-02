// 일반 레이아웃(layout.tsx)과 정적 데모 레이아웃(layout.demo.tsx)이 함께 쓰는 화면 틀.
import Link from "next/link";

/** 말풍선 안의 하트: "대화로 마음을 읽는다"는 서비스 성격을 담은 로고. 단색. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M20 3C10.6 3 3 9.6 3 17.8c0 4.6 2.4 8.7 6.2 11.4L8 36.2c-.2 1 .9 1.7 1.7 1.1l6.4-4.4c1.3.2 2.6.4 3.9.4 9.4 0 17-6.6 17-14.8S29.4 3 20 3Z"
        className="fill-brand-500"
      />
      <path
        d="M20 25.5s-7-4.3-7-9.2c0-2.3 1.8-4 3.9-4 1.4 0 2.5.7 3.1 1.8.6-1.1 1.7-1.8 3.1-1.8 2.1 0 3.9 1.7 3.9 4 0 4.9-7 9.2-7 9.2Z"
        fill="#fff"
      />
    </svg>
  );
}

const NAV = [
  { href: "/", label: "분석하기" },
  { href: "/history", label: "기록" },
  { href: "/search", label: "검색" },
];

export function SiteHeader({ right }: { right: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-900/[0.06] bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoMark />
          <span className="text-[17px] font-semibold text-ink-900">연애 분석 AI</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-ink-600">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-2 py-2 transition-colors duration-150 ease-out hover:text-ink-900 sm:px-3"
            >
              {n.label}
            </Link>
          ))}
          <span className="ml-2">{right}</span>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ note }: { note: React.ReactNode }) {
  return (
    <footer className="mx-auto max-w-3xl space-y-3 px-4 pb-12 pt-8 text-center text-xs text-ink-500">
      <p>{note}</p>
      <p className="flex items-center justify-center gap-3">
        <Link href="/terms" className="transition-colors duration-150 ease-out hover:text-ink-900">
          이용약관
        </Link>
        <span aria-hidden>·</span>
        <Link href="/privacy" className="transition-colors duration-150 ease-out hover:text-ink-900">
          개인정보 처리방침
        </Link>
      </p>
    </footer>
  );
}

/** Pretendard 웹폰트 (지정만 하고 불러오지 않으면 Windows에서 맑은 고딕으로 나온다) */
export const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

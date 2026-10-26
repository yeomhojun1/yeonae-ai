// 데모 빌드(NEXT_PUBLIC_DEMO=true) 전용 레이아웃.
// next.config.mjs 가 데모 빌드에서만 pageExtensions 를 "demo.tsx" 로 바꾸므로,
// 평소 빌드에서는 이 파일이 무시되고 데모 빌드에서는 layout.tsx 대신 이 파일이 쓰인다.
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "연애 대화 분석 AI (데모)",
  description:
    "카톡·DM 대화를 붙여넣으면 호감도, 답장 추천, 위험 신호, 다음 행동을 분석해 주는 앱의 데모입니다.",
};

export default function DemoRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div
          role="note"
          className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900"
        >
          데모 모드: 실제 AI·서버 없이 미리 준비한 결과로 동작합니다.
        </div>
        <header className="border-b border-rose-100 bg-white/70 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="flex shrink-0 items-center gap-1.5 text-base font-bold sm:text-lg">
              <span aria-hidden>💘</span>
              <span className="text-brand-600">연애 분석 AI</span>
            </Link>
            <nav className="flex items-center gap-2.5 text-sm text-slate-600 sm:gap-4">
              <Link href="/" className="hover:text-brand-600">
                분석<span className="hidden sm:inline">하기</span>
              </Link>
              <Link href="/history" className="hover:text-brand-600">
                기록
              </Link>
              <Link href="/search" className="hover:text-brand-600">
                검색
              </Link>
              <a
                href="https://github.com/yeomhojun1/yeonae-ai"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
              >
                소스
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl space-y-2 px-4 py-10 text-center text-xs text-slate-400">
          <p>
            데모의 대화는 모두 지어낸 가상 대화이고, 분석 결과는 실제 AI 출력이
            아니라 앱의 결과 형식에 맞춰 미리 작성한 예시입니다.
          </p>
          <p className="flex items-center justify-center gap-3">
            <Link href="/terms" className="hover:text-brand-600">
              이용약관
            </Link>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-brand-600">
              개인정보 처리방침
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}

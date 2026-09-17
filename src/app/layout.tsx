import type { Metadata } from "next";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import "./globals.css";

export const metadata: Metadata = {
  title: "연애 대화 분석 AI",
  description:
    "카톡·DM 대화를 붙여넣으면 호감도, 답장 추천, 위험 신호, 다음 행동을 AI가 분석해드려요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
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
              <AuthButtons />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl space-y-2 px-4 py-10 text-center text-xs text-slate-400">
          <p>
            AI 분석은 참고용이에요. 최종 판단은 본인의 몫! · 대화 내용은 분석
            목적으로만 사용됩니다.
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

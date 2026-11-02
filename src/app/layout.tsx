import type { Metadata } from "next";
import AuthButtons from "@/components/AuthButtons";
import { PRETENDARD_CSS, SiteFooter, SiteHeader } from "@/components/SiteChrome";
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
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
      </head>
      <body>
        <SiteHeader right={<AuthButtons />} />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <SiteFooter note="AI 분석은 참고용이에요. 최종 판단은 본인의 몫이에요 · 대화 내용은 분석 목적으로만 사용됩니다" />
      </body>
    </html>
  );
}

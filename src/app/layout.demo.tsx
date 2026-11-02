// 데모 빌드(NEXT_PUBLIC_DEMO=true) 전용 레이아웃.
// next.config.mjs 가 데모 빌드에서만 pageExtensions 를 "demo.tsx" 로 바꾸므로,
// 평소 빌드에서는 이 파일이 무시되고 데모 빌드에서는 layout.tsx 대신 이 파일이 쓰인다.
import type { Metadata } from "next";
import { PRETENDARD_CSS, SiteFooter, SiteHeader } from "@/components/SiteChrome";
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
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
      </head>
      <body>
        <div
          role="note"
          className="bg-ink-100 px-4 py-2 text-center text-sm text-ink-700"
        >
          데모 모드: 실제 AI·서버 없이 미리 준비한 결과로 동작합니다.
        </div>
        <SiteHeader
          right={
            <a
              href="https://github.com/yeomhojun1/yeonae-ai"
              className="inline-flex h-8 items-center rounded-lg border border-ink-900/10 bg-white px-3 text-ink-700 transition-colors duration-150 ease-out hover:text-ink-900"
            >
              소스
            </a>
          }
        />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <SiteFooter note="데모의 대화는 모두 지어낸 가상 대화이고, 분석 결과는 실제 AI 출력이 아니라 앱의 결과 형식에 맞춰 미리 작성한 예시입니다." />
      </body>
    </html>
  );
}

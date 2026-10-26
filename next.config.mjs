// NEXT_PUBLIC_DEMO=true 로 빌드하면 GitHub Pages용 정적 데모(서버·DB·AI 없음)를 만든다.
// 데모 빌드에서는 pageExtensions 를 "demo.tsx"/"demo.ts" 로 바꿔
// src/app 아래 *.demo.tsx 파일만 라우트로 쓰고, API 라우트·로그인 의존 페이지(page.tsx, route.ts)는 빌드에서 빠진다.
// 평소 빌드에서는 *.demo.tsx 가 라우트로 인식되지 않으므로 기존 동작은 그대로다.
const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";
const demoBasePath = process.env.DEMO_BASE_PATH ?? "/yeonae-ai";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isDemo && {
    output: "export",
    pageExtensions: ["demo.tsx", "demo.ts"],
    basePath: demoBasePath,
    assetPrefix: demoBasePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;

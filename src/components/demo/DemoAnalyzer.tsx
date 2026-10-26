"use client";

// 데모 모드 분석 화면: 서버 API 대신 미리 준비한 결과(src/lib/demo)를 쓴다.
import Analyzer from "@/components/Analyzer";
import { DEMO_SAMPLES, demoAnalyze } from "@/lib/demo";

export default function DemoAnalyzer() {
  return <Analyzer demo localAnalyze={demoAnalyze} samples={DEMO_SAMPLES} />;
}

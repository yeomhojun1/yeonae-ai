import Analyzer from "@/components/Analyzer";

// ⚠️ 로컬 데모 전용 페이지: 로그인/DB 없이 분석 화면을 체험합니다.
export default function DemoPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        🧪 <b>데모 모드</b> — 로그인·DB 없이 <b>대화 입력 → AI 분석</b> 화면만
        체험합니다. 결과는 <b>항상 고정된 예시(샘플)</b>예요. 내 대화로 실제 AI
        분석을 받으려면 로그인 후 이용해주세요.
      </div>
      <Analyzer endpoint="/api/demo-analyze" demo />
    </div>
  );
}

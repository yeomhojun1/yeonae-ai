import Analyzer from "@/components/Analyzer";

// ⚠️ 로컬 데모 전용 페이지: 로그인/DB 없이 분석 화면을 체험합니다.
export default function DemoPage() {
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-ink-100 px-4 py-3 text-sm leading-[22px] text-ink-700">
        <span className="font-medium text-ink-900">체험 모드</span> · 로그인 없이 실제 AI 분석을
        써 볼 수 있어요. 결과는 저장되지 않아요.
      </p>
      <Analyzer endpoint="/api/demo-analyze" demo />
    </div>
  );
}

import Analyzer from "@/components/Analyzer";

// ⚠️ 로컬 데모 전용 페이지: 로그인/DB 없이 분석 화면을 체험합니다.
export default function DemoPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        🧪 <b>데모 모드</b> — 로그인·DB 없이 <b>대화 입력 → AI 분석</b> 화면만
        체험합니다. Claude API 키가 없으면 <b>예시(목업) 결과</b>가 표시돼요.
      </div>
      <Analyzer endpoint="/api/demo-analyze" demo />
    </div>
  );
}

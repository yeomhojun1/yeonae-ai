// 데모 빌드 전용 첫 화면: 로그인 없이 바로 샘플 대화로 분석을 체험한다.
import DemoAnalyzer from "@/components/demo/DemoAnalyzer";

export default function DemoHomePage() {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-slate-600">
        로그인 없이 바로 써 볼 수 있어요. 아래 <b>샘플 대화</b> 버튼을 누른 뒤{" "}
        <b>AI로 분석하기</b>를 누르면, 실서비스와 같은 형식의 분석 결과(호감도
        점수·신호·답장 추천·다음 행동)가 나옵니다.
      </p>
      <DemoAnalyzer />
    </div>
  );
}

// 데모 빌드 전용 검색 화면: 로그인 없이 샘플 기록을 의미로 검색한다.
import DemoSearch from "@/components/demo/DemoSearch";

export default function DemoSearchPage() {
  return (
    <div className="space-y-4">
      <DemoSearch />
      <p className="text-center text-xs text-slate-400">
        데모 검색 결과는 실서비스와 같은 로컬 임베딩 모델(multilingual-e5-small)로
        샘플 대화 4개를 미리 색인·검색해 저장해 둔 값입니다.
      </p>
    </div>
  );
}

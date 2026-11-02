// 데모 빌드 전용 기록 목록: DB 대신 샘플 분석 기록을 보여 준다.
import { DEMO_SAMPLES } from "@/lib/demo/samples";
import { HistoryList, PageTitle } from "@/components/HistoryParts";

export default function DemoHistoryPage() {
  return (
    <div className="space-y-6">
      <PageTitle sub="데모용 샘플 기록이에요. 실서비스에서는 로그인한 사용자의 분석이 여기에 저장돼요.">
        분석 기록
      </PageTitle>
      <HistoryList items={DEMO_SAMPLES} />
    </div>
  );
}

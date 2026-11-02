// ===== [마일스톤2: 검색] — 검색 페이지(서버 컴포넌트) =====
// 검색은 로그인한 사용자의 기록만 대상으로 하므로, 화면 진입 단계에서 세션을 확인한다.
// 비로그인이면 /history 와 동일하게 로그인 안내를 보여주고, 실제 검색 UI는
// 클라이언트 컴포넌트(SearchClient)로 분리한다.
import { auth } from "@/auth";
import { LoginPrompt } from "@/components/HistoryParts";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <LoginPrompt
        title="기록 검색"
        desc="로그인하면 내 분석 기록을 의미로 검색할 수 있어요"
      />
    );
  }

  return <SearchClient />;
}

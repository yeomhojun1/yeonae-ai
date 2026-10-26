"use client";

// 데모 모드 검색 화면: 실제 임베딩 모델로 미리 계산해 둔 결과(src/lib/demo/search-results.json)를 쓴다.
import SearchClient from "@/app/search/SearchClient";
import { DEMO_QUERIES, demoSearch } from "@/lib/demo";

export default function DemoSearch() {
  return <SearchClient localSearch={demoSearch} suggestions={DEMO_QUERIES} />;
}

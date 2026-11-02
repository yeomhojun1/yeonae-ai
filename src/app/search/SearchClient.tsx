// ===== [마일스톤2: 검색] — 검색 화면(React 컴포넌트) =====
// 사용자가 질문을 입력 → fetch로 /api/rag/search 호출 → 결과를 화면에 표시.
// React 핵심: useState(상태) / onClick·onKeyDown(이벤트) / fetch(서버요청) / {조건 && ...}(조건부 표시)
"use client"; // 이 파일은 브라우저에서 도는 컴포넌트 (상태·클릭 등 상호작용 담당)

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PageTitle } from "@/components/HistoryParts";

interface SearchHit {
  chunkId: string;
  sessionId: string;
  sessionTitle: string;
  text: string;
  score: number;
}

/** 정적 데모 빌드용: 서버 API 대신 브라우저 안에서 결과를 돌려준다. */
export type LocalSearch = (
  query: string
) => { ok: true; data: SearchHit[] } | { ok: false; error: string };

export default function SearchClient({
  localSearch,
  suggestions,
}: {
  localSearch?: LocalSearch;
  suggestions?: string[];
} = {}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  async function handleSearch(q: string = query) {
    setError(null);
    setHits(null);
    setLoading(true);
    if (localSearch) {
      await new Promise((r) => setTimeout(r, 300));
      const out = localSearch(q);
      if (out.ok) setHits(out.data);
      else setError(out.error);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, k: 5 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "검색에 실패했어요.");
        return;
      }
      setHits(data.hits as SearchHit[]);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle sub="지난 대화 속에서 의미로 찾아드려요. 예) “서운했던 순간”, “읽씹당한 패턴”">
        기록 검색
      </PageTitle>

      <div className="card p-6">
        <div className="flex gap-2">
          <div className="relative w-full">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim().length >= 2) handleSearch();
              }}
              placeholder="찾고 싶은 순간"
              className="field pl-11"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || query.trim().length < 2}
            className="btn-primary shrink-0"
          >
            {loading ? <Icon name="loader" className="h-[18px] w-[18px] animate-spin" /> : "검색"}
          </button>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-500">예시 검색어</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  handleSearch(s);
                }}
                className="inline-flex h-8 items-center rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-700 transition-colors duration-150 ease-out hover:border-brand-300 hover:text-brand-600"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-[10px] bg-brand-50 px-4 py-3 text-sm text-brand-700">{error}</p>
        )}
      </div>

      {hits && (
        <div className="space-y-4">
          <h2 className="text-[20px] font-medium text-ink-900">
            관련 대화 <span className="tabular-nums text-ink-500">{hits.length}건</span>
          </h2>
          {hits.length === 0 && (
            <p className="text-[15px] text-ink-600">
              검색된 대화가 없어요. 먼저 대화를 분석해 기록을 쌓아주세요.
            </p>
          )}
          {hits.map((hit, i) => (
            <Link
              key={hit.chunkId}
              href={`/history/${hit.sessionId}`}
              className="card block p-5 transition-colors duration-150 ease-out hover:border-ink-900/20"
            >
              <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                <span className="truncate text-ink-500">
                  <span className="tabular-nums">{i + 1}</span> · {hit.sessionTitle}
                </span>
                <span className="shrink-0 tabular-nums text-ink-500">
                  유사도 <span className="font-medium text-brand-600">{(hit.score * 100).toFixed(0)}%</span>
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-ink-700">
                {hit.text.length > 200 ? hit.text.slice(0, 200) + "…" : hit.text}
              </p>
            </Link>
          ))}
          <p className="pt-1 text-center text-xs text-ink-500">
            유사도는 절대값보다 순위로 보세요 (임베딩 의미 검색)
          </p>
        </div>
      )}
    </div>
  );
}

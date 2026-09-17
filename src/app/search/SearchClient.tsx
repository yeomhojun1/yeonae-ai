// ===== [마일스톤2: 검색] — 검색 화면(React 컴포넌트) =====
// 사용자가 질문을 입력 → fetch로 /api/rag/search 호출 → 결과를 화면에 표시.
// React 핵심: useState(상태) / onClick·onKeyDown(이벤트) / fetch(서버요청) / {조건 && ...}(조건부 표시)
"use client"; // 이 파일은 브라우저에서 도는 컴포넌트 (상태·클릭 등 상호작용 담당)

import { useState } from "react";
import Link from "next/link";

interface SearchHit {
  chunkId: string;
  sessionId: string;
  sessionTitle: string;
  text: string;
  score: number;
}

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  async function handleSearch() {
    setError(null);
    setHits(null);
    setLoading(true);
    try {
      const res = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 5 }),
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
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-800">
          히스토리 의미 검색 🔎
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          지난 대화들 속에서 의미로 찾아드려요. 예) &quot;서운했던 순간&quot;,
          &quot;읽씹당한 패턴&quot;
        </p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim().length >= 2) handleSearch();
            }}
            placeholder="무엇을 찾을까요? (의미로 검색돼요)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading || query.trim().length < 2}
            className="shrink-0 rounded-xl bg-brand-500 px-5 font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "…" : "검색"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
      </div>

      {hits && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">
            관련 대화 {hits.length}건
          </h2>
          {hits.length === 0 && (
            <p className="text-sm text-slate-500">
              검색된 대화가 없어요. 먼저 대화를 분석해 기록을 쌓아주세요.
            </p>
          )}
          {hits.map((hit, i) => (
            <Link
              key={hit.chunkId}
              href={`/history/${hit.sessionId}`}
              className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-brand-200"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  #{i + 1} · {hit.sessionTitle}
                </span>
                <span className="text-xs font-medium text-brand-500">
                  유사도 {(hit.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {hit.text.length > 200
                  ? hit.text.slice(0, 200) + "…"
                  : hit.text}
              </p>
            </Link>
          ))}
          <p className="pt-1 text-center text-xs text-slate-400">
            유사도는 절대값보다 순위로 보세요. (임베딩 의미 검색)
          </p>
        </div>
      )}
    </div>
  );
}

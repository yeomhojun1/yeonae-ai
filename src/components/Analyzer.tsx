"use client";

import { useState } from "react";
import Link from "next/link";
import AnalysisView from "@/components/AnalysisView";
import type { StoredSession } from "@/lib/types";

export default function Analyzer() {
  const [rawText, setRawText] = useState("");
  const [relationship, setRelationship] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoredSession | null>(null);

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, relationship }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "분석에 실패했어요.");
        return;
      }
      setResult(data as StoredSession);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!result && (
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-800">
            대화 붙여넣고 마음 읽기 💘
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            카톡·DM 대화를 붙여넣으면 호감도, 답장 추천, 위험 신호를 분석해드려요.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          관계 상태 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="예) 소개팅 2번 만남 / 썸 3주차 / 사귀는 중"
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700">
          대화 내용 <span className="font-normal text-slate-400">(필수)</span>
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          placeholder={"카톡 대화를 그대로 붙여넣어 주세요.\n\n예)\n나: 오늘 뭐했어?\n상대: 그냥 집에 있었어ㅎㅎ 너는?\n나: 나도 쉬었지~"}
          className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand-400"
        />
        <div className="mt-1 text-right text-xs text-slate-400">
          {rawText.length.toLocaleString()}자
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || rawText.trim().length < 10}
          className="mt-4 w-full rounded-xl bg-brand-500 py-3 font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "분석 중… 🔍" : "AI로 분석하기"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          무료 분석은 하루 3회예요.
        </p>
      </div>

      {result && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">분석 결과</h2>
            <button
              onClick={() => {
                setResult(null);
                setRawText("");
                setRelationship("");
              }}
              className="text-sm text-slate-500 hover:text-brand-600"
            >
              새 분석 하기 +
            </button>
          </div>
          <AnalysisView result={result.result} />
          <div className="text-center">
            <Link
              href={`/history/${result.id}`}
              className="text-sm text-brand-600 hover:underline"
            >
              이 분석은 기록에 저장됐어요 →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { AnalysisResult, Signal } from "@/lib/types";

function scoreColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

function ScoreGauge({ score, level }: { score: number; level: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-500">호감도 · 대화 흐름 점수</p>
          <p className="text-4xl font-extrabold text-slate-800">
            {score}
            <span className="text-lg font-medium text-slate-400"> / 100</span>
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600">
          호감도 {level}
        </span>
      </div>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`animate-grow h-full rounded-full ${scoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

const signalStyle: Record<Signal["type"], { label: string; cls: string; icon: string }> = {
  positive: { label: "좋은 신호", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: "✅" },
  negative: { label: "위험 신호", cls: "bg-rose-50 text-rose-700 border-rose-100", icon: "⚠️" },
  neutral: { label: "참고", cls: "bg-slate-50 text-slate-600 border-slate-200", icon: "ℹ️" },
};

export default function AnalysisView({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState<number | null>(null);

  async function copy(text: string, i: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard 미지원 무시 */
    }
  }

  return (
    <div className="space-y-5">
      <ScoreGauge score={result.score} level={result.interestLevel} />

      {/* 요약 */}
      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <h3 className="mb-2 font-bold text-slate-800">🧭 관계 흐름 요약</h3>
        <p className="whitespace-pre-line leading-relaxed text-slate-700">
          {result.summary}
        </p>
      </section>

      {/* 신호 */}
      {result.signals.length > 0 && (
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-slate-800">🔎 신호 분석</h3>
          <ul className="space-y-2">
            {result.signals.map((s, i) => {
              const st = signalStyle[s.type];
              return (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${st.cls}`}
                >
                  <span aria-hidden>{st.icon}</span>
                  <span>
                    <b className="mr-1">[{st.label}]</b>
                    {s.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 답장 추천 */}
      {result.replySuggestions.length > 0 && (
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-slate-800">💬 답장 추천</h3>
          <div className="space-y-3">
            {result.replySuggestions.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {r.tone}
                  </span>
                  <button
                    onClick={() => copy(r.content, i)}
                    className="text-xs text-slate-400 hover:text-brand-600"
                  >
                    {copied === i ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-slate-800">{r.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 다음 행동 */}
      {result.nextActions.length > 0 && (
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-slate-800">👉 다음 행동 추천</h3>
          <ul className="list-inside list-disc space-y-1 text-slate-700">
            {result.nextActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

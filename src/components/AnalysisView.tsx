"use client";

import { useState } from "react";
import { MyBubble, ScoreRing } from "@/components/ChatParts";
import Icon from "@/components/Icon";
import type { AnalysisResult, Signal } from "@/lib/types";

// 점수 구간별 한 줄 코멘트 (숫자만 보여주면 차갑게 느껴져서)
function scoreMood(score: number) {
  if (score >= 80) return "설렘 신호가 많이 보여요";
  if (score >= 65) return "분위기가 좋아요";
  if (score >= 50) return "조금 더 지켜봐요";
  if (score >= 35) return "온도가 살짝 내려갔어요";
  return "천천히 다시 다가가 봐요";
}

const signalStyle: Record<Signal["type"], { label: string; dot: string }> = {
  positive: { label: "좋은 신호", dot: "bg-emerald-600" },
  negative: { label: "위험 신호", dot: "bg-red-600" },
  neutral: { label: "참고", dot: "bg-ink-400" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h3 className="mb-4 text-[16px] font-medium text-ink-900">{title}</h3>
      {children}
    </section>
  );
}

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
    <div className="animate-rise space-y-4">
      {/* 점수 */}
      <section className="card flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:text-left">
        <ScoreRing score={result.score} />
        <div>
          <p className="text-sm text-ink-500">호감도 · 대화 흐름 점수</p>
          <p className="mt-2 text-[24px] font-medium leading-tight text-ink-900">{scoreMood(result.score)}</p>
          <p className="mt-3 text-sm text-ink-600">
            호감도 <span className="font-medium text-brand-600">{result.interestLevel}</span>
          </p>
        </div>
      </section>

      <Section title="관계 흐름 요약">
        <p className="whitespace-pre-line text-[15px] leading-[26px] text-ink-700">{result.summary}</p>
      </Section>

      {result.signals.length > 0 && (
        <Section title="신호 분석">
          <ul className="space-y-3">
            {result.signals.map((s, i) => {
              const st = signalStyle[s.type];
              return (
                <li key={i} className="flex gap-3 text-[15px] leading-6 text-ink-700">
                  <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`} aria-hidden />
                  <span>
                    <span className="mr-2 font-medium text-ink-900">{st.label}</span>
                    {s.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* 답장 추천: 내가 보낼 카톡 말풍선으로 보여준다 */}
      {result.replySuggestions.length > 0 && (
        <section className="card overflow-hidden">
          <h3 className="px-6 pt-6 text-[16px] font-medium text-ink-900">이렇게 답해 보세요</h3>
          <div className="mt-4 space-y-4 bg-ink-100 px-6 py-6">
            {result.replySuggestions.map((r, i) => (
              <div key={i}>
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-xs text-ink-500">{r.tone}</span>
                  <button
                    onClick={() => copy(r.content, i)}
                    className="inline-flex h-6 items-center gap-1 rounded-md bg-white px-2 text-xs text-ink-600 transition-colors duration-150 ease-out hover:text-ink-900"
                  >
                    <Icon name={copied === i ? "check" : "copy"} className="h-3.5 w-3.5" />
                    {copied === i ? "복사됨" : "복사"}
                  </button>
                </div>
                <MyBubble>{r.content}</MyBubble>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.nextActions.length > 0 && (
        <Section title="다음 행동 추천">
          <ol className="space-y-3">
            {result.nextActions.map((a, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-6 text-ink-700">
                <span className="w-4 shrink-0 text-right tabular-nums text-ink-500">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalysisView from "@/components/AnalysisView";
import DeleteButton from "./DeleteButton";
import type { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await prisma.analysisSession.findUnique({ where: { id } });

  if (!session) notFound();

  const result = session.resultJson as unknown as AnalysisResult;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/history" className="text-sm text-slate-400 hover:text-brand-600">
            ← 기록 목록
          </Link>
          <h1 className="mt-1 truncate text-xl font-extrabold text-slate-800">
            {session.title}
          </h1>
          <p className="text-xs text-slate-400">{fmt(session.createdAt)}</p>
        </div>
        <DeleteButton id={session.id} />
      </div>

      <AnalysisView result={result} />

      <details className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-bold text-slate-700">
          분석에 사용한 원본 대화 보기
        </summary>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          {session.rawText}
        </pre>
      </details>
    </div>
  );
}

// 데모 빌드 전용 기록 상세: 샘플 id 마다 정적 페이지를 미리 만든다.
import Link from "next/link";
import { notFound } from "next/navigation";
import AnalysisView from "@/components/AnalysisView";
import { DEMO_SAMPLES } from "@/lib/demo/samples";

export const dynamicParams = false;

export function generateStaticParams() {
  return DEMO_SAMPLES.map((s) => ({ id: s.id }));
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

export default async function DemoHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = DEMO_SAMPLES.find((s) => s.id === id);
  if (!session) notFound();

  return (
    <div className="space-y-5">
      <div className="min-w-0">
        <Link href="/history" className="text-sm text-slate-400 hover:text-brand-600">
          ← 기록 목록
        </Link>
        <h1 className="mt-1 truncate text-xl font-extrabold text-slate-800">
          {session.title}
        </h1>
        <p className="text-xs text-slate-400">
          {fmt(session.createdAt)} · {session.relationship}
        </p>
      </div>

      <AnalysisView result={session.result} />

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

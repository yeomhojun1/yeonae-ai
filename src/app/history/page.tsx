import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function scoreBadge(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <h1 className="text-xl font-extrabold text-slate-800">분석 기록</h1>
        <p className="text-sm text-slate-500">
          로그인하면 내 분석 기록을 볼 수 있어요.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-brand-500 px-4 py-2.5 font-bold text-white hover:bg-brand-600"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  const sessions = await prisma.analysisSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, score: true, createdAt: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-slate-800">분석 기록</h1>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-8 text-center text-slate-500">
          아직 분석 기록이 없어요.
          <div className="mt-3">
            <Link
              href="/"
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              첫 분석 하러 가기
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/history/${s.id}`}
                className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">
                    {s.title}
                  </p>
                  <p className="text-xs text-slate-400">{fmt(s.createdAt)}</p>
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-3 py-1 text-sm font-bold ${scoreBadge(
                    s.score
                  )}`}
                >
                  {s.score}점
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

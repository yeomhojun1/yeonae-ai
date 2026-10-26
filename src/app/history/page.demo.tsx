// 데모 빌드 전용 기록 목록: DB 대신 샘플 분석 기록을 보여 준다.
import Link from "next/link";
import { DEMO_SAMPLES } from "@/lib/demo/samples";

function fmt(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

function scoreBadge(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export default function DemoHistoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-slate-800">분석 기록</h1>
      <p className="text-sm text-slate-500">
        데모용 샘플 기록이에요. 실서비스에서는 로그인한 사용자의 분석이 여기에
        저장돼요.
      </p>
      <ul className="space-y-2">
        {DEMO_SAMPLES.map((s) => (
          <li key={s.id}>
            <Link
              href={`/history/${s.id}`}
              className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{s.title}</p>
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
    </div>
  );
}

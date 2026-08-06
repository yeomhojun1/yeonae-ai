import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREE_DAILY_LIMIT, seoulDayKey } from "@/lib/usage";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(d);
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [totalCount, usage, user] = await Promise.all([
    prisma.analysisSession.count({ where: { userId } }),
    prisma.dailyUsage.findUnique({
      where: { userId_day: { userId, day: seoulDayKey() } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true },
    }),
  ]);

  const usedToday = usage?.count ?? 0;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - usedToday);

  return (
    <div className="mx-auto max-w-lg space-y-6 py-2">
      <h1 className="text-xl font-extrabold text-slate-800">마이페이지</h1>

      {/* 프로필 */}
      <div className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
            💘
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-800">
            {user?.name ?? "회원"}님
          </p>
          <p className="truncate text-sm text-slate-500">
            {user?.email ?? "소셜 로그인 계정"}
          </p>
          {user?.createdAt && (
            <p className="mt-0.5 text-xs text-slate-400">
              가입일 {fmtDate(user.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* 사용량 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-slate-500">오늘 남은 무료 분석</p>
          <p className="mt-1 text-3xl font-extrabold text-brand-600">
            {remaining}
            <span className="text-base font-bold text-slate-400">
              /{FREE_DAILY_LIMIT}회
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-slate-500">지금까지 분석</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-800">
            {totalCount}
            <span className="text-base font-bold text-slate-400">회</span>
          </p>
        </div>
      </div>

      {remaining === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
          오늘 무료 분석을 모두 사용했어요. 내일 다시 이용할 수 있어요 🙏
        </p>
      )}

      {/* 바로가기 */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link
          href="/"
          className="rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-brand-600"
        >
          새 분석하기
        </Link>
        <Link
          href="/history"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
        >
          내 기록
        </Link>
        <Link
          href="/search"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
        >
          기록 검색
        </Link>
      </div>

      {/* 로그아웃 */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="pt-2 text-center"
      >
        <button className="text-sm text-slate-400 underline hover:text-slate-600">
          로그아웃
        </button>
      </form>
    </div>
  );
}

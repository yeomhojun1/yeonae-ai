import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREE_DAILY_LIMIT, seoulDayKey } from "@/lib/usage";
import { PageTitle } from "@/components/HistoryParts";

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
  const displayName = user?.name ?? "회원";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageTitle>마이페이지</PageTitle>

      {/* 프로필 */}
      <div className="card flex items-center gap-4 p-6">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-[20px] font-medium text-brand-600">
            {displayName.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[16px] font-medium text-ink-900">{displayName}님</p>
          <p className="mt-1 truncate text-sm text-ink-600">{user?.email ?? "소셜 로그인 계정"}</p>
          {user?.createdAt && (
            <p className="mt-1 text-xs text-ink-500">가입일 {fmtDate(user.createdAt)}</p>
          )}
        </div>
      </div>

      {/* 사용량 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6">
          <p className="text-sm text-ink-500">오늘 남은 무료 분석</p>
          <p className="mt-2 text-[32px] font-medium leading-none tabular-nums text-brand-600">
            {remaining}
            <span className="ml-1 text-[15px] text-ink-500">/ {FREE_DAILY_LIMIT}회</span>
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-ink-500">지금까지 분석</p>
          <p className="mt-2 text-[32px] font-medium leading-none tabular-nums text-ink-900">
            {totalCount}
            <span className="ml-1 text-[15px] text-ink-500">회</span>
          </p>
        </div>
      </div>

      {remaining === 0 && (
        <p className="rounded-xl bg-ink-100 px-4 py-3 text-center text-sm text-ink-700">
          오늘 무료 분석을 모두 사용했어요. 내일 다시 이용할 수 있어요
        </p>
      )}

      {/* 바로가기 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/" className="btn-primary sm:flex-1">
          새 분석하기
        </Link>
        <Link
          href="/history"
          className="inline-flex h-12 items-center justify-center rounded-[10px] border border-ink-900/10 bg-white px-5 text-[15px] text-ink-700 transition-colors duration-150 ease-out hover:text-ink-900 sm:flex-1"
        >
          내 기록
        </Link>
        <Link
          href="/search"
          className="inline-flex h-12 items-center justify-center rounded-[10px] border border-ink-900/10 bg-white px-5 text-[15px] text-ink-700 transition-colors duration-150 ease-out hover:text-ink-900 sm:flex-1"
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
        <button className="text-sm text-ink-500 underline underline-offset-4 transition-colors duration-150 ease-out hover:text-ink-900">
          로그아웃
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { HistoryList, LoginPrompt, PageTitle } from "@/components/HistoryParts";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    return <LoginPrompt title="분석 기록" desc="로그인하면 내 분석 기록을 볼 수 있어요" />;
  }

  const sessions = await prisma.analysisSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, score: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <PageTitle>분석 기록</PageTitle>

      {sessions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[15px] text-ink-600">아직 분석 기록이 없어요</p>
          <Link href="/" className="btn-primary mt-6">
            첫 분석 하러 가기
          </Link>
        </div>
      ) : (
        <HistoryList items={sessions} />
      )}
    </div>
  );
}

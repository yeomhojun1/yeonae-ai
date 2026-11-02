import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import AnalysisView from "@/components/AnalysisView";
import { DetailHeader, RawConversation, fmtDateTime } from "@/components/HistoryParts";
import DeleteButton from "./DeleteButton";
import type { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authSession = await auth();
  if (!authSession?.user) redirect("/login");

  const { id } = await params;
  const session = await prisma.analysisSession.findUnique({ where: { id } });

  if (!session || session.userId !== authSession.user.id) notFound();

  const result = session.resultJson as unknown as AnalysisResult;

  return (
    <div className="space-y-6">
      <DetailHeader
        title={session.title}
        meta={fmtDateTime(session.createdAt)}
        action={<DeleteButton id={session.id} />}
      />
      <AnalysisView result={result} />
      <RawConversation text={session.rawText} />
    </div>
  );
}

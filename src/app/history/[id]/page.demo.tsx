// 데모 빌드 전용 기록 상세: 샘플 id 마다 정적 페이지를 미리 만든다.
import { notFound } from "next/navigation";
import AnalysisView from "@/components/AnalysisView";
import { DetailHeader, RawConversation, fmtDateTime } from "@/components/HistoryParts";
import { DEMO_SAMPLES } from "@/lib/demo/samples";

export const dynamicParams = false;

export function generateStaticParams() {
  return DEMO_SAMPLES.map((s) => ({ id: s.id }));
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
    <div className="space-y-6">
      <DetailHeader
        title={session.title}
        meta={`${fmtDateTime(session.createdAt)} · ${session.relationship}`}
      />
      <AnalysisView result={session.result} />
      <RawConversation text={session.rawText} />
    </div>
  );
}

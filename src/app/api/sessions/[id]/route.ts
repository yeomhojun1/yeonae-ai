import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnalysisResult, StoredSession } from "@/lib/types";

// 분석 기록 단건 조회
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.analysisSession.findUnique({ where: { id } });

  if (!session) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const payload: StoredSession = {
    id: session.id,
    title: session.title,
    rawText: session.rawText,
    score: session.score,
    result: session.resultJson as unknown as AnalysisResult,
    createdAt: session.createdAt.toISOString(),
  };

  return NextResponse.json(payload);
}

// 분석 기록 삭제
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.analysisSession.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

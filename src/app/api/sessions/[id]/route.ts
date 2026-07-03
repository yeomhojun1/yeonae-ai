import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { AnalysisResult, StoredSession } from "@/lib/types";

// 분석 기록 단건 조회 (본인 것만)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.analysisSession.findUnique({ where: { id } });

  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const payload: StoredSession = {
    id: item.id,
    title: item.title,
    rawText: item.rawText,
    score: item.score,
    result: item.resultJson as unknown as AnalysisResult,
    createdAt: item.createdAt.toISOString(),
  };

  return NextResponse.json(payload);
}

// 분석 기록 삭제 (본인 것만)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.analysisSession.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.analysisSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 분석 기록 목록 (최신순)
export async function GET() {
  const sessions = await prisma.analysisSession.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      score: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    sessions.map((s) => ({
      id: s.id,
      title: s.title,
      score: s.score,
      createdAt: s.createdAt.toISOString(),
    }))
  );
}

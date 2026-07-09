import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { indexSession } from "@/lib/rag";

// 로그인한 사용자의 모든 분석 세션을 RAG 인덱싱(재인덱싱)한다.
// 이미 저장된 과거 대화를 검색 대상으로 만들기 위한 백필 용도.
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const userId = session.user.id;

  const sessions = await prisma.analysisSession.findMany({
    where: { userId },
    select: { id: true, rawText: true },
  });

  let totalChunks = 0;
  for (const s of sessions) {
    totalChunks += await indexSession(s.id, userId, s.rawText);
  }

  return NextResponse.json({
    indexedSessions: sessions.length,
    totalChunks,
  });
}

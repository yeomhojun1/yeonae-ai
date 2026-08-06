import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { indexSession } from "@/lib/rag";

// 재인덱싱은 사용자의 모든 세션을 CPU로 임베딩하는 무거운 작업이므로,
// 남용(반복 호출로 서버 CPU를 태우는 self-DoS)을 막기 위한 쿨다운.
const REINDEX_COOLDOWN_MS = 10 * 60 * 1000; // 10분

// 로그인한 사용자의 모든 분석 세션을 RAG 인덱싱(재인덱싱)한다.
// 이미 저장된 과거 대화를 검색 대상으로 만들기 위한 백필 용도.
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const userId = session.user.id;

  // 쿨다운 체크 (사용자별 10분에 1회)
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastReindexAt: true },
  });
  const last = me?.lastReindexAt?.getTime() ?? 0;
  const now = Date.now();
  if (now - last < REINDEX_COOLDOWN_MS) {
    const waitSec = Math.ceil((REINDEX_COOLDOWN_MS - (now - last)) / 1000);
    return NextResponse.json(
      { error: `재인덱싱은 잠시 후에 다시 시도해주세요. (약 ${waitSec}초)` },
      { status: 429 }
    );
  }
  await prisma.user.update({
    where: { id: userId },
    data: { lastReindexAt: new Date() },
  });

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

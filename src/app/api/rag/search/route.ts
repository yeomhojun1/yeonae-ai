import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchChunks } from "@/lib/rag";

// 히스토리 의미 검색: 질문을 받아 사용자의 과거 대화 조각 중 관련 top-k를 반환.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const userId = session.user.id;

  let query: string;
  let k: number;
  try {
    const body = (await req.json()) as { query?: string; k?: number };
    query = (body.query ?? "").trim();
    k = Math.min(Math.max(body.k ?? 5, 1), 20);
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (query.length < 2) {
    return NextResponse.json(
      { error: "검색어를 2자 이상 입력해주세요." },
      { status: 400 }
    );
  }

  const hits = await searchChunks(userId, query, k);
  return NextResponse.json({ query, hits });
}

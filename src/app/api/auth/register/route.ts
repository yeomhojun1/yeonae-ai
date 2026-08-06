import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// 아주 느슨한 이메일 형식 검사 (실전에서는 인증 메일로 확정)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const NAME_MAX = 30;

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim().slice(0, NAME_MAX) || null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "올바른 이메일 형식이 아니에요." },
      { status: 400 }
    );
  }
  if (password.length < PASSWORD_MIN) {
    return NextResponse.json(
      { error: `비밀번호는 ${PASSWORD_MIN}자 이상이어야 해요.` },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // 소셜로 만든 계정이든 이메일 계정이든 이미 그 이메일이 있으면 가입 불가.
    return NextResponse.json(
      { error: "이미 가입된 이메일이에요. 로그인해주세요." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

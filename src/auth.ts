import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials(이메일/비밀번호) provider는 DB 세션 전략과 호환되지 않으므로 JWT로 운영한다.
  // 카카오 등 OAuth 로그인도 JWT 전략에서 정상 동작한다(User/Account는 adapter가 계속 DB에 저장).
  session: { strategy: "jwt" },
  providers: [
    // AUTH_KAKAO_ID / AUTH_KAKAO_SECRET 환경변수를 자동으로 사용합니다.
    // 기본 provider는 빈 scope(`?scope`)를 보내 카카오에서 KOE004를 유발하므로,
    // url과 scope(profile_nickname)를 명시적으로 지정합니다.
    Kakao({
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: { scope: "profile_nickname" },
      },
    }),
    // 이메일 + 비밀번호 로그인.
    Credentials({
      name: "email",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        // 소셜 전용 계정(passwordHash 없음)이거나 존재하지 않는 계정이면 거부.
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // JWT 전략: 최초 로그인 시 user.id를 토큰에 심는다.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // 세션에 user.id 노출 (클라이언트/서버에서 소유권 확인에 사용)
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

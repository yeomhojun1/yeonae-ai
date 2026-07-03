import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    // AUTH_KAKAO_ID / AUTH_KAKAO_SECRET 환경변수를 자동으로 사용합니다.
    Kakao,
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 세션에 user.id를 노출 (database 전략에서는 user 객체가 전달됨)
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

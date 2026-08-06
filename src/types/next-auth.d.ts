import type { DefaultSession } from "next-auth";

// 세션 타입 확장: user.id 추가
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// JWT 타입 확장: 토큰에 사용자 id 저장
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

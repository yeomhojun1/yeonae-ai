import type { DefaultSession } from "next-auth";

// 세션 타입 확장: user.id 추가
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

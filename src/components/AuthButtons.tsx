import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AuthButtons() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/account"
          className="hidden text-slate-600 hover:text-brand-600 sm:inline"
        >
          {session.user.name ?? "회원"}님
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50">
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
    >
      로그인
    </Link>
  );
}

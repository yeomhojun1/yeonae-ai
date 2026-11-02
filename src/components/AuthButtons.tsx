import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AuthButtons() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/account"
          className="hidden text-ink-600 transition-colors duration-150 ease-out hover:text-ink-900 sm:inline"
        >
          {session.user.name ?? "회원"}님
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="inline-flex h-8 items-center rounded-lg border border-ink-900/10 bg-white px-3 text-ink-700 transition-colors duration-150 ease-out hover:text-ink-900">
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex h-8 items-center rounded-lg bg-ink-900 px-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-ink-800"
    >
      로그인
    </Link>
  );
}

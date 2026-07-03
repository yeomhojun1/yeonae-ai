import { auth, signIn, signOut } from "@/auth";

export default async function AuthButtons() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden text-slate-600 sm:inline">
          {session.user.name ?? "회원"}님
        </span>
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
    <form
      action={async () => {
        "use server";
        await signIn("kakao", { redirectTo: "/" });
      }}
    >
      <button className="rounded-lg bg-[#FEE500] px-3 py-1.5 text-sm font-semibold text-[#3C1E1E] hover:brightness-95">
        카카오 로그인
      </button>
    </form>
  );
}

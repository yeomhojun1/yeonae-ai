import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="mx-auto max-w-sm space-y-6 py-10 text-center">
      <div>
        <div className="text-5xl">💘</div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-800">
          로그인하고 시작하기
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          로그인하면 내 분석 기록을 저장하고 다시 볼 수 있어요.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("kakao", { redirectTo: "/" });
        }}
      >
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 font-bold text-[#3C1E1E] transition hover:brightness-95">
          <span aria-hidden>💬</span> 카카오로 시작하기
        </button>
      </form>

      <p className="text-xs text-slate-400">
        로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
      </p>
    </div>
  );
}

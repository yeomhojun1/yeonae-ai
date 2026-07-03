import Link from "next/link";
import { auth, signIn } from "@/auth";
import Analyzer from "@/components/Analyzer";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-10 text-center">
        <div className="text-5xl">💘</div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            연애 대화 분석 AI
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            카톡·DM 대화를 붙여넣으면 호감도, 답장 추천, 위험 신호를 분석해드려요.
            <br />
            시작하려면 로그인해주세요.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("kakao", { redirectTo: "/" });
          }}
        >
          <button className="w-full rounded-xl bg-[#FEE500] py-3 font-bold text-[#3C1E1E] transition hover:brightness-95">
            💬 카카오로 시작하기
          </button>
        </form>
        <p className="text-xs text-slate-400">
          이미 계정이 있다면 위 버튼으로 바로 로그인됩니다.{" "}
          <Link href="/login" className="underline">
            로그인 페이지
          </Link>
        </p>
      </div>
    );
  }

  return <Analyzer />;
}

import Link from "next/link";
import { auth } from "@/auth";
import Analyzer from "@/components/Analyzer";

const FEATURES = [
  {
    icon: "💯",
    title: "상대 호감도 점수",
    desc: "대화 흐름을 읽고 0~100점으로 상대의 관심도를 가늠해줘요.",
  },
  {
    icon: "💬",
    title: "답장 추천 3가지",
    desc: "가볍게 · 진솔하게 · 밀당까지, 상황에 맞는 답장을 대신 골라줘요.",
  },
  {
    icon: "🚩",
    title: "위험 신호 감지",
    desc: "관심이 식는 신호, 읽씹 패턴 등 놓치기 쉬운 부분을 짚어줘요.",
  },
  {
    icon: "🧭",
    title: "다음 행동 제안",
    desc: "지금 고백해도 될지, 만남을 제안할 타이밍인지 현실적으로 조언해요.",
  },
];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    return <Analyzer />;
  }

  return (
    <div className="space-y-14 py-6">
      {/* Hero */}
      <section className="mx-auto max-w-xl text-center">
        <div className="text-6xl">💘</div>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-800 sm:text-4xl">
          그 사람 마음,
          <br />
          <span className="text-brand-600">대화로 읽어드려요</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-slate-500">
          카톡·DM 대화를 붙여넣기만 하면 AI가 상대의 호감도, 어떻게 답하면
          좋을지, 위험 신호까지 분석해줘요.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-brand-500 px-6 py-3 text-center font-bold text-white transition hover:bg-brand-600 sm:w-auto"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/demo"
            className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-center font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600 sm:w-auto"
          >
            먼저 예시 보기
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          가입 없이 데모로 체험할 수 있어요 · 무료 분석 하루 3회
        </p>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-bold text-slate-800">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-xl">
        <h2 className="text-center text-xl font-extrabold text-slate-800">
          이렇게 써요
        </h2>
        <ol className="mt-6 space-y-4">
          {[
            "카톡 대화를 복사하거나, 대화 내보내기(.txt) 파일을 올려요.",
            "관계 상태(썸 3주차 등)를 간단히 적으면 더 정확해져요.",
            "AI가 호감도·답장·위험 신호를 분석해줘요. 결과는 기록에 저장돼요.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm text-slate-600">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Privacy note */}
      <section className="mx-auto max-w-xl rounded-2xl bg-rose-50/60 p-5 text-center">
        <p className="text-sm text-slate-600">
          🔒 대화 내용은 <b>분석 목적으로만</b> 사용되며, 광고나 제3자 제공에
          쓰지 않아요. 자세한 내용은{" "}
          <Link href="/privacy" className="font-semibold text-brand-600 underline">
            개인정보 처리방침
          </Link>
          에서 확인하세요.
        </p>
      </section>

      {/* Final CTA */}
      <section className="text-center">
        <Link
          href="/signup"
          className="inline-block rounded-xl bg-brand-500 px-8 py-3 font-bold text-white transition hover:bg-brand-600"
        >
          지금 무료로 시작하기 →
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            로그인
          </Link>
        </p>
      </section>
    </div>
  );
}

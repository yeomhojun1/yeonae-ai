import Link from "next/link";
import { auth } from "@/auth";
import Analyzer from "@/components/Analyzer";
import { MyBubble, ScoreRing, TheirBubble } from "@/components/ChatParts";
import Icon, { type IconName } from "@/components/Icon";

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "activity",
    title: "상대 호감도 점수",
    desc: "대화 흐름을 읽고 0~100점으로 상대의 관심도를 가늠해줘요.",
  },
  {
    icon: "message",
    title: "답장 추천 3가지",
    desc: "가볍게 · 진솔하게 · 밀당까지, 상황에 맞는 답장을 대신 골라줘요.",
  },
  {
    icon: "flag",
    title: "위험 신호 감지",
    desc: "관심이 식는 신호, 읽씹 패턴 등 놓치기 쉬운 부분을 짚어줘요.",
  },
  {
    icon: "compass",
    title: "다음 행동 제안",
    desc: "지금 고백해도 될지, 만남을 제안할 타이밍인지 현실적으로 조언해요.",
  },
];

const STEPS = [
  { title: "대화 붙여넣기", desc: "카톡 대화를 복사하거나 내보내기(.txt) 파일을 올려요" },
  { title: "관계 한 줄 적기", desc: "‘썸 3주차’처럼 적으면 더 정확해져요" },
  { title: "결과 확인", desc: "호감도, 보낼 답장, 위험 신호를 한 화면에서 봐요" },
];

/** 첫 화면의 제품 미리보기: 실제 결과 화면을 줄여 놓은 것 (가상 대화) */
function HeroPreview() {
  return (
    <div className="card overflow-hidden shadow-float">
      <div className="flex h-12 items-center justify-between border-b border-ink-900/[0.06] px-4">
        <span className="text-sm font-medium text-ink-900">민지</span>
        <span className="text-xs text-ink-500">소개팅 2번 만남</span>
      </div>
      <div className="space-y-2 bg-ink-100 px-4 py-4">
        <TheirBubble time="오후 11:42">이번 주말에 뭐 해?</TheirBubble>
        <MyBubble time="오후 11:43" unread={false}>
          아직 계획 없어 왜?
        </MyBubble>
        <TheirBubble time="오후 11:45">그럼 같이 전시 보러 갈래? 보고 싶던 거 있어서ㅎㅎ</TheirBubble>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={87} size={72} stroke={7} />
          <div>
            <p className="text-xs text-ink-500">상대 호감도</p>
            <p className="mt-1 text-[15px] font-medium text-ink-900">높음 · 먼저 만남을 제안했어요</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-ink-500">이렇게 답해 보세요</p>
          <MyBubble>좋아 나도 궁금했어 토요일 오후 어때?</MyBubble>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    return <Analyzer />;
  }

  return (
    <div className="bleed space-y-24 pb-8 pt-4 sm:pt-12">
      {/* Hero */}
      <section className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div className="animate-rise">
          <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[48px] lg:text-[56px]">
            그 사람 마음,
            <br />
            대화로 읽어드려요
          </h1>
          <p className="mt-6 max-w-[34rem] text-[18px] leading-[30px] text-ink-600">
            카톡 대화를 붙여넣으면 상대의 호감도와 보낼 만한 답장, 놓치기 쉬운 신호를
            알려드려요. 가입 없이 하루 3회 무료예요.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Link href="/demo" className="btn-primary">
              무료로 분석해 보기
              <Icon name="arrow" />
            </Link>
            <Link href="/login" className="btn-quiet">
              로그인
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm animate-rise [animation-delay:60ms] md:max-w-none">
          <HeroPreview />
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-[28px] font-medium leading-tight text-ink-900">
          혼자 고민하던 그 대화, 같이 읽어요
        </h2>
        <div className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4 border-t border-ink-900/[0.08] pt-6">
              <span className="mt-0.5 text-ink-500">
                <Icon name={f.icon} />
              </span>
              <div>
                <h3 className="text-[16px] font-medium text-ink-900">{f.title}</h3>
                <p className="mt-1 text-[14px] leading-[22px] text-ink-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-[28px] font-medium leading-tight text-ink-900">세 단계면 돼요</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-6">
              <span className="text-sm tabular-nums text-ink-500">{i + 1}</span>
              <p className="mt-3 text-[16px] font-medium text-ink-900">{s.title}</p>
              <p className="mt-1 text-[14px] leading-[22px] text-ink-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Privacy */}
      <section className="card flex items-start gap-4 p-6">
        <span className="mt-0.5 text-ink-500">
          <Icon name="lock" />
        </span>
        <p className="text-[14px] leading-[22px] text-ink-600">
          <span className="font-medium text-ink-900">내 대화는 내 것이니까.</span>{" "}
          전화번호·주소·계좌 같은 개인정보는 AI에 보내기 전에 자동으로 가리고, 대화는 분석
          목적으로만 써요.{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand-600 underline-offset-4 transition-colors duration-150 ease-out hover:underline"
          >
            개인정보 처리방침
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="py-8 text-center">
        <h2 className="text-[28px] font-medium leading-tight text-ink-900">
          답장 보내기 전에, 한 번만 물어보세요
        </h2>
        <p className="mt-3 text-[15px] text-ink-600">가입 없이 바로, 하루 3회 무료</p>
        <Link href="/demo" className="btn-primary mt-8">
          무료로 분석해 보기
          <Icon name="arrow" />
        </Link>
      </section>
    </div>
  );
}

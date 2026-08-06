import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 · 연애 대화 분석 AI",
};

// ⚠️ 실서비스용 표준 초안. 정식 오픈 전 실제 처리 현황(보관기간, 위탁업체 등)에
//    맞춰 수정하고 법률 검토를 받는 것을 권장합니다.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 py-4 text-slate-700">
      <h1 className="text-2xl font-extrabold text-slate-800">
        개인정보 처리방침
      </h1>
      <p className="text-sm text-slate-400">시행일: 2026-07-31</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">
          1. 수집하는 개인정보 항목
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>회원가입 시: 이메일, 비밀번호(암호화 저장), 닉네임(선택)</li>
          <li>소셜 로그인 시: 소셜 서비스가 제공하는 프로필 닉네임</li>
          <li>서비스 이용 시: 이용자가 분석을 위해 입력한 대화 텍스트, 분석 결과</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">
          2. 개인정보의 이용 목적
        </h2>
        <p className="text-sm leading-relaxed">
          수집한 정보는 회원 식별 및 로그인, 대화 분석 결과 제공과 저장, 분석
          기록 조회(검색) 기능 제공 목적으로만 이용합니다. 광고·마케팅이나 제3자
          제공 목적으로 사용하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">
          3. AI 분석을 위한 처리
        </h2>
        <p className="text-sm leading-relaxed">
          입력한 대화는 분석을 위해 AI 모델 제공사(예: Anthropic)에 전송되어
          처리될 수 있습니다. 해당 처리는 분석 결과 생성 목적에 한하며, 전송되는
          내용에는 이용자를 특정할 수 있는 계정 정보가 포함되지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">
          4. 보관 및 파기
        </h2>
        <p className="text-sm leading-relaxed">
          분석 기록은 이용자가 삭제하거나 회원 탈퇴 시까지 보관되며, 요청 시
          지체 없이 파기합니다. 관계 법령에 따라 별도 보관이 필요한 경우 해당
          기간 동안만 분리 보관합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">
          5. 이용자의 권리
        </h2>
        <p className="text-sm leading-relaxed">
          이용자는 언제든지 자신의 분석 기록을 조회·삭제할 수 있으며, 계정 및
          개인정보의 삭제(탈퇴)를 요청할 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">
          6. 개인정보 보호책임자
        </h2>
        <p className="text-sm leading-relaxed">
          개인정보 관련 문의는 (이메일 주소 기입)으로 연락 주시기 바랍니다.
        </p>
      </section>
    </article>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 · 연애 대화 분석 AI",
};

// ⚠️ 아래는 실서비스용 표준 초안입니다. 정식 오픈 전 상호·사업자 정보를
//    채우고 법률 검토를 받는 것을 권장합니다.
export default function TermsPage() {
  return (
    <article className="prose-sm mx-auto max-w-2xl space-y-6 py-4 text-slate-700">
      <h1 className="text-2xl font-extrabold text-slate-800">이용약관</h1>
      <p className="text-sm text-slate-400">시행일: 2026-07-31</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">제1조 (목적)</h2>
        <p className="text-sm leading-relaxed">
          본 약관은 &lsquo;연애 대화 분석 AI&rsquo;(이하 &ldquo;서비스&rdquo;)가
          제공하는 대화 분석 및 관련 기능의 이용 조건과 절차, 이용자와 서비스의
          권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">제2조 (서비스 내용)</h2>
        <p className="text-sm leading-relaxed">
          서비스는 이용자가 입력한 대화 텍스트를 인공지능으로 분석하여 호감도
          추정, 답장 추천, 신호 분석 등 참고 정보를 제공합니다. 분석 결과는
          참고용이며, 상대방의 실제 감정이나 관계의 결과를 보장하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">제3조 (계정)</h2>
        <p className="text-sm leading-relaxed">
          이용자는 이메일 또는 소셜 로그인으로 계정을 생성할 수 있으며, 계정
          정보의 관리 책임은 이용자에게 있습니다. 타인의 정보를 도용하여 가입할
          수 없습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">제4조 (이용자의 의무)</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>타인의 대화를 동의 없이 무단으로 수집·입력하지 않습니다.</li>
          <li>불법·유해 정보를 입력하거나 서비스를 오·남용하지 않습니다.</li>
          <li>서비스의 정상적인 운영을 방해하는 행위를 하지 않습니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">제5조 (책임의 한계)</h2>
        <p className="text-sm leading-relaxed">
          서비스가 제공하는 분석은 AI에 의한 추정으로 정확성을 보장하지 않으며,
          이를 신뢰하여 내린 결정의 결과에 대해 서비스는 책임을 지지 않습니다.
          최종 판단과 행동의 책임은 이용자 본인에게 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800">제6조 (약관의 변경)</h2>
        <p className="text-sm leading-relaxed">
          서비스는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며,
          변경 시 서비스 내 공지를 통해 안내합니다.
        </p>
      </section>

      <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">
        문의: (이메일 주소 기입) · 운영자: (상호/사업자 정보 기입)
      </p>
    </article>
  );
}

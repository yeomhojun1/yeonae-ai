// 기록·검색 화면이 함께 쓰는 조각 (일반 빌드와 정적 데모 빌드 공용)
import Link from "next/link";
import { ScoreRing } from "@/components/ChatParts";
import Icon from "@/components/Icon";

export function fmtDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(d));
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="pt-4">
      <h1 className="text-[28px] font-medium leading-tight text-ink-900">{children}</h1>
      {sub && <p className="mt-2 text-[15px] leading-6 text-ink-600">{sub}</p>}
    </div>
  );
}

/** 비로그인 사용자에게 보여주는 안내 */
export function LoginPrompt({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card mx-auto mt-8 max-w-md p-8 text-center">
      <h1 className="text-[24px] font-medium text-ink-900">{title}</h1>
      <p className="mt-2 text-[15px] leading-6 text-ink-600">{desc}</p>
      <Link href="/login" className="btn-primary mt-6">
        로그인하기
      </Link>
    </div>
  );
}

export interface HistoryItem {
  id: string;
  title: string;
  score: number;
  createdAt: Date | string;
}

export function HistoryList({ items }: { items: HistoryItem[] }) {
  return (
    <ul className="card divide-y divide-ink-900/[0.06] overflow-hidden">
      {items.map((s) => (
        <li key={s.id}>
          <Link
            href={`/history/${s.id}`}
            className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 ease-out hover:bg-ink-50"
          >
            <ScoreRing score={s.score} size={44} stroke={4} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink-900">{s.title}</p>
              <p className="mt-1 text-xs tabular-nums text-ink-500">{fmtDateTime(s.createdAt)}</p>
            </div>
            <Icon name="arrow" className="h-4 w-4 shrink-0 text-ink-400" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 기록 상세 위쪽: 목록으로 돌아가기 + 제목 + 날짜 */
export function DetailHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="pt-4">
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm text-ink-500 transition-colors duration-150 ease-out hover:text-ink-900"
      >
        <Icon name="back" className="h-4 w-4" />
        기록 목록
      </Link>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-[28px] font-medium leading-tight text-ink-900">{title}</h1>
          <p className="mt-2 text-sm tabular-nums text-ink-500">{meta}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

/** 분석에 쓴 원본 대화 (접어 두기) */
export function RawConversation({ text }: { text: string }) {
  return (
    <details className="card group p-6">
      <summary className="cursor-pointer list-none text-[16px] font-medium text-ink-900">
        분석에 사용한 원본 대화 보기
      </summary>
      <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-ink-50 p-4 font-sans text-sm leading-6 text-ink-700">
        {text}
      </pre>
    </details>
  );
}

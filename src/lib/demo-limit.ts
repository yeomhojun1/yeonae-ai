// 비로그인 데모 분석의 서버 쪽 호출 제한.
// 데모는 DB를 쓰지 않으므로 서버 메모리에서 센다. 서버가 재시작되거나
// 서버리스 인스턴스가 여러 개면 인스턴스마다 따로 센다(완벽한 차단이 아니라 남용 완화용).
import { FREE_DAILY_LIMIT, seoulDayKey } from "./usage";

// 무료 LLM 키 한도를 지키기 위한 서비스 전체 하루 상한. 여러 IP로 돌려도 이 이상은 호출하지 않는다.
const DEFAULT_GLOBAL_DAILY_LIMIT = 300;

export type DemoSlot = { ok: true } | { ok: false; reason: "ip" | "global" };

let currentDay = "";
const perIp = new Map<string, number>();
let globalCount = 0;

function globalLimit(): number {
  const n = Number(process.env.DEMO_GLOBAL_DAILY_LIMIT);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_GLOBAL_DAILY_LIMIT;
}

// 날짜가 바뀌면 카운터를 비운다(지난 날짜 키가 메모리에 쌓이지 않게).
function rollDay() {
  const day = seoulDayKey();
  if (day !== currentDay) {
    currentDay = day;
    perIp.clear();
    globalCount = 0;
  }
}

/** 요청 헤더에서 클라이언트 IP를 고른다. Vercel 등 프록시가 넣는 x-forwarded-for의 첫 값. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** AI 호출 "전에" 한 슬롯을 선점한다. 한도를 넘으면 선점하지 않고 거절 사유를 돌려준다. */
export function takeDemoSlot(ip: string): DemoSlot {
  rollDay();
  const used = perIp.get(ip) ?? 0;
  if (used >= FREE_DAILY_LIMIT) return { ok: false, reason: "ip" };
  if (globalCount >= globalLimit()) return { ok: false, reason: "global" };
  perIp.set(ip, used + 1);
  globalCount++;
  return { ok: true };
}

/** AI 호출이 실패했을 때 선점한 슬롯을 돌려준다(사용자가 다시 시도할 수 있게). */
export function refundDemoSlot(ip: string) {
  rollDay();
  const used = perIp.get(ip) ?? 0;
  if (used > 0) perIp.set(ip, used - 1);
  if (globalCount > 0) globalCount--;
}

/** 테스트용: 카운터 초기화 */
export function resetDemoLimits() {
  currentDay = "";
  perIp.clear();
  globalCount = 0;
}

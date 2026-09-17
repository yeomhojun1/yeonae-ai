# yeonae-ai 수정 보고 (2026-09-17)

> 5개 프로젝트 전체 현황: https://claude.ai/artifact/PvWqAcbkvtL8VSNHZhL48e

`feature-test-report.md`의 문제 1~10 대응 + 자동화 테스트 도입 결과.
**커밋하지 않았습니다.** 전부 워킹트리에 미커밋 상태로 남겨두었으니 Eclipse/Git 클라이언트에서 검토 후 직접 커밋하세요.

## 한 줄 요약

- 문제 1~9 수정 완료, 문제 10(RAG 하이브리드)은 의도적으로 보류(아래 "다음 작업" 참고).
- 자동화 테스트 **17개** 신규 추가 → `npm test` 통과 (Anthropic 키·DB 없이 동작).
- 검증: `npx tsc --noEmit` 오류 0 / `npm run lint` 통과 / `npm test` 17 pass 0 fail / dev 서버(3000) 페이지 GET 확인.
- `npm run build`는 **미실행** (이유는 아래 "실행하지 않은 것").

---

## 1. 고친 항목

### #1 `npm run lint` 실패 (유일한 FAIL) — 해결

| 항목 | 내용 |
|---|---|
| 조치 | `npm i -D eslint@8.57.1 eslint-config-next@15.5.20` 설치 + `.eslintrc.json` 신규 생성 |
| 파일 | `.eslintrc.json`(신규), `package.json`, `package-lock.json` |

```json
{
  "extends": "next/core-web-vitals",
  "ignorePatterns": [".next/", "node_modules/", "prisma/generated/"]
}
```

- **결과**: `npm run lint` → `✔ No ESLint warnings or errors`, exit 0. 대화형 프롬프트 사라짐.
- **기존 코드에 걸린 규칙 없음** — 완화하거나 수정한 규칙이 하나도 없습니다.
- `src/app/account/page.tsx:39`의 `// eslint-disable-next-line @next/next/no-img-element` 는 **살아 있는 상태로 확인**했습니다.
  검증 방법: `npx eslint --report-unused-disable-directives src/app/account/page.tsx` → "unused disable directive" 경고가 나오지 않음
  = 그 규칙이 실제로 활성화되어 있고 해당 줄을 억제하고 있다는 뜻.
- ESLint 9가 아니라 **8.57.1**을 고른 이유: `next lint`(Next 15)는 `.eslintrc` 기반 경로가 가장 안정적이고, Node 18에서도 문제없이 돕니다.

> 참고: `next lint`는 Next 16에서 제거 예정이라는 deprecation 경고를 출력합니다(exit 0, 실패 아님). 마이그레이션은 아래 "다음 작업"에 남겼습니다.

### #2 README 모델명 불일치 — 수정

- `README.md:56` : `claude-opus-4-8` → **`claude-sonnet-5`**
- 근거: `src/lib/claude.ts:6` `const MODEL = "claude-sonnet-5";` 가 정본.

### #3 데모 안내 문구 + 샘플 enum 위반 — 수정

- `src/app/demo/page.tsx:8-10` : "Claude API 키가 없으면 예시(목업) 결과가 표시돼요"
  → **"결과는 항상 고정된 예시(샘플)예요. 내 대화로 실제 AI 분석을 받으려면 로그인 후 이용해주세요."**
  (`/api/demo-analyze`는 키 유무와 무관하게 항상 고정 샘플을 반환하므로 실제 동작과 일치시킴)
- `src/app/api/demo-analyze/route.ts:9` : `interestLevel: "중간 이상"` → **`"높음"`**
  (`claude.ts`의 `ANALYSIS_SCHEMA` enum: 매우 높음/높음/보통/낮음/매우 낮음. score 72에 대응)
- **회귀 테스트 추가**: `tests/demo-analyze.test.ts` — 샘플의 `interestLevel`이 enum 안의 값인지 단언.

### #4 `/search` 비로그인 게이트 — 수정

- `/history`와 동일한 "로그인 안내" 방식으로 통일했습니다(리다이렉트 대신, 클라이언트 컴포넌트를 분리해 서버에서 세션 확인).
- `src/app/search/page.tsx` : 클라이언트 컴포넌트 → **서버 컴포넌트**로 전환. `auth()`로 세션 확인 후
  비로그인이면 "로그인하면 내 분석 기록을 의미로 검색할 수 있어요" + 로그인 버튼 렌더.
- `src/app/search/SearchClient.tsx` **(신규)** : 기존 검색 UI 전체를 그대로 옮김(`SearchPage` → `SearchClient` 이름만 변경, 로직 무변경).
- 검증: 비로그인 `GET /search` → 200 + 로그인 안내 렌더(검색창 노출 안 됨).

### #5 모바일 내비게이션 — 수정

- `src/app/layout.tsx:22,26,27,33`

| 변경 | 전 | 후 |
|---|---|---|
| "분석하기" 링크 | `hidden ... sm:inline` (폰에서 숨김) | 항상 노출, 라벨만 `분석` + `하기`는 `sm` 이상 |
| "검색" 링크 | `hidden ... sm:inline` (폰에서 숨김) | **항상 노출** |
| 로고 | `text-lg` | `text-base sm:text-lg` (폭 확보) |
| nav 간격 | `gap-3` | `gap-2.5 sm:gap-4` (폭 확보) |

- 햄버거/하단탭 대신 **기존 헤더 구조를 유지한 채 폭만 줄이는 방식**을 골랐습니다(diff 최소, 디자인 일관).
  폰 폭에서 헤더는 `💘 연애 분석 AI / 분석 · 기록 · 검색 / 로그인` 으로 한 줄에 들어갑니다.
- 검증: `GET /`의 HTML에서 `href="/search">검색`이 `hidden` 클래스 없이 렌더되는 것 확인.

### #6 회원가입 중복 레이스 — 수정

- `src/app/api/auth/register/route.ts:44-71`
- `prisma.user.create`를 `try/catch`로 감싸고, Prisma unique 위반(`P2002`)이면 500이 아니라 **409 + 기존과 동일한 문구**로 응답.
- `isUniqueViolation()` 헬퍼는 `e.code === "P2002"` 덕타이핑 — `Prisma.PrismaClientKnownRequestError` import 없이 번들 영향 0.
- P2002가 아닌 예외는 그대로 `throw`(기존 동작 유지).

### #7 재인덱싱 쿨다운이 실패해도 소모됨 — 수정

- `src/app/api/rag/reindex/route.ts`
- `lastReindexAt` 갱신을 **작업 전 → 작업 성공 후**로 이동(임베딩 루프 끝난 뒤, 응답 직전).
- 이제 인덱싱 중 예외가 나면 쿨다운이 소모되지 않아 즉시 재시도 가능.
- (트레이드오프: 재인덱싱이 진행 중일 때 동시 요청이 들어오면 두 번 돌 수 있습니다. 원래 쿨다운 목적이 "남용 방지"이고, 실패 시 10분 잠기는 쪽이 더 나쁘다고 판단했습니다. 완전한 동시성 차단이 필요하면 별도 `reindexingAt` 잠금 컬럼이 필요 → 스키마 변경이라 이번엔 제외.)

### #8 카톡 파서 정규식 과탐 — 수정

- `src/lib/kakao.ts:16-18, 29-40`
- 두 가지를 동시에 좁혔습니다:
  1. **줄 시작 앵커**: `/(님과 카카오톡 대화|저장한 날짜|저장한 대화)/` → `/^(?:.{0,40}님과 카카오톡 대화|저장한 날짜|저장한 대화)/`
  2. **적용 범위 제한**: `HEADER_SCAN_LINES = 5` — 파일 앞 5줄에서만 헤더로 판정 (루프를 `for...of` → 인덱스 루프로)
- 이제 `[홍길동] [오후 3:00] 그 사진 저장한 날짜 기억나?` 같은 본문이 통째로 사라지지 않습니다.
- **회귀 테스트 2개 추가** (`tests/kakao.test.ts`): 본문 안 어구 보존 / 5줄 밖 어구 보존 + 진짜 헤더는 여전히 제거.

### #9 `.gitignore` — 수정

- `.gitignore:18` `# debug` 섹션에 **`.run.log`** 추가. `git status`에서 사라진 것 확인.

### #10 RAG 하이브리드 검색 — **보류 (손대지 않음)**

지시대로 "복잡하면 손대지 말고 다음 작업으로" 를 택했습니다. 판단 근거:

- `scripts/eval-hybrid.ts`의 하이브리드는 **16개 corpus 전체를 JS에서 재랭킹**하는 구조입니다. 프로덕션 `searchChunksPg`는 pgvector가 DB에서 top-k만 잘라오므로, 같은 걸 하려면 (a) 후보를 넉넉히(예: top-30) 가져와 JS에서 bigram 렉시컬 점수 + RRF 융합하거나, (b) Postgres full-text/pg_trgm 인덱스를 추가해야 합니다.
- (b)는 **원격 DB 스키마 변경**이라 금지 조건에 걸립니다.
- (a)는 스키마 변경 없이 가능하지만, **실제 원격 DB에 붙어 검증해야** 의미가 있는데 이번 작업은 DB 접근을 읽기 전용 GET으로 제한했습니다. 검증 못 한 검색 로직을 프로덕션 경로에 넣는 건 위험하다고 봤습니다.
- F1 0.25 → 0.30(+0.05, 12문제 골든셋)은 실 사용 체감 개선으로 보기엔 근거가 얇기도 합니다.

---

## 2. 추가한 테스트 (17개)

러너: 프로젝트에 기존 테스트 인프라가 없어 **`node --test` + `tsx`** 조합으로 도입(추가 devDependency 0개 — `tsx`는 이미 있었음).

```json
"test": "node --import tsx --test tests/chunk.test.ts tests/kakao.test.ts tests/embeddings.test.ts tests/demo-analyze.test.ts"
```

| 파일 | 테스트 수 | 내용 |
|---|---|---|
| `tests/kakao.test.ts` | 5 | iOS/PC `[이름] [시각]` 형식, Android `2024년/2024. 1. 1.` 형식, 카톡 형식 없으면 원문 유지, **#8 회귀 2건**(본문 안 헤더 어구 보존 / 5줄 밖 어구 보존) |
| `tests/chunk.test.ts` | 5 | 빈 입력→`[]`, maxChars 상한 + index 연속, overlap 1줄(다음 조각이 직전 마지막 줄로 시작), overlap 0이면 줄 수 보존, 700자 한 줄→1조각 |
| `tests/embeddings.test.ts` | 3 | `cosineSimilarity` 동일=1·직교=0·반대=-1, 크기 불변성, **`embed()` 384차원 + L2 norm 1 + NaN 없음** |
| `tests/demo-analyze.test.ts` | 4 | **10자 미만→400**, 빈 body/깨진 JSON→400, 정상 입력→200 + rawText 왕복·replies 3개, **#3 회귀**(interestLevel enum 검증) |

- 과금·DB 쓰기 **전혀 없음**: 카톡/청킹/코사인은 순수 함수, 임베딩은 로컬 `@xenova` 모델(node_modules 캐시), `/api/demo-analyze`는 라우트 핸들러를 직접 호출하는데 이 라우트는 Anthropic도 Prisma도 import하지 않습니다.
- `ANTHROPIC_API_KEY`/`DATABASE_URL` 없이 통과합니다.

실행 결과:

```
# tests 17
# pass 17
# fail 0
# duration_ms 8084.7
```

(임베딩 모델 로드 3초 포함 — 그래서 해당 테스트만 timeout 120s로 여유를 뒀습니다.)

---

## 3. 검증 결과

| 검증 | 명령 | 결과 |
|---|---|---|
| 타입체크 | `npx tsc --noEmit` | **PASS** — 오류 0, exit 0 (신규 `tests/*.ts` 포함) |
| 린트 | `npm run lint` | **PASS** — `✔ No ESLint warnings or errors`, exit 0 |
| 테스트 | `npm test` | **PASS** — 17/17 |
| disable 주석 유효성 | `npx eslint --report-unused-disable-directives src/app/account/page.tsx` | **PASS** — unused 경고 없음 = `@next/next/no-img-element` 규칙 살아있음 |

dev 서버(3000) GET 검증 — 서버는 종료하지 않고 그대로 사용:

| 경로 | 상태 | 확인한 요소 |
|---|---|---|
| `/` | 200 | 헤더에 `href="/search">검색`이 `hidden` 없이 렌더, `분석<span class="hidden sm:inline">하기</span>` |
| `/demo` | 200 | "항상 고정된 예시(샘플)" 문구 반영, "AI로 분석하기" 버튼 유지 |
| `/search` | 200 | **"로그인하면 내 분석 기록을 의미로 검색할 수 있어요" + 로그인하기 버튼**, 검색 입력창("무엇을 찾을까요") 미노출 |
| `/account` | 307 | 기존대로 `/login` 리다이렉트 (회귀 없음) |
| `/login` | 200 | 정상 |

git diff 확인(커밋 안 함) — 모두 최소 diff, 줄바꿈 오염 없음(`core.autocrlf=true`로 정규화되어 diff에 CRLF 잡음 없음):

```
 .gitignore                         |  1 +
 README.md                          |  2 +-
 package.json                       |  3 +
 package-lock.json                  | (eslint 254패키지 설치분)
 src/app/api/auth/register/route.ts | 27 +-
 src/app/api/demo-analyze/route.ts  |  2 +-
 src/app/api/rag/reindex/route.ts   | 12 +-
 src/app/demo/page.tsx              |  3 +-
 src/app/layout.tsx                 | 10 +-
 src/app/search/page.tsx            | 137 +-   (서버 컴포넌트로 전환)
 src/lib/kakao.ts                   | 15 +-
신규: .eslintrc.json, src/app/search/SearchClient.tsx, tests/(4개)
```

---

## 4. 의도적으로 실행하지 않은 것과 이유

| 항목 | 이유 |
|---|---|
| **Anthropic 호출** (`/api/analyze`, `src/lib/claude.ts`) | 과금 금지. 코드는 읽기만 했고 호출 0건. `claude.ts`는 이번에 **수정도 하지 않았습니다**(README를 코드에 맞춤). |
| **`.env` 값 열람** | 지시대로 값은 읽지도 출력하지도 않았습니다. 키 **이름**만 참고. |
| **원격 Neon DB 쓰기** | 회원가입/로그인/분석저장/재인덱싱 요청 0건. `prisma db push`·`prisma studio`·마이그레이션 미실행. dev 서버에는 비로그인 GET만 보냈습니다. |
| **`npm run build`** | **미실행**. 쓰기 위험은 없다고 확인했지만(아래), `next build`가 **현재 3000에서 돌고 있는 dev 서버와 같은 `.next/` 디렉터리를 덮어써서** dev 서버를 망가뜨립니다. "dev 서버 그대로 두라"는 지시가 우선이라 돌리지 않았습니다. |
| **`scripts/*.ts` 직접 실행** (`reindex-rag`, `setup-pgvector`, `test-search` 등) | 원격 DB 직접 접근(일부 쓰기 포함). 미실행. |
| **문제 #10 하이브리드 적용** | 위 참조 — 검증 불가 + 스키마 변경 금지. |
| **git add/commit/push** | 금지 지시대로 전부 미커밋. |

### `npm run build`의 DB 쓰기 위험 분석 (실행은 안 했지만 확인한 내용)

- `build` = `prisma generate && next build`.
- `prisma generate`는 `schema.prisma`만 읽고 `node_modules/.prisma`에 코드 생성 → **DB 접속 없음**.
- Prisma를 쓰는 페이지는 **전부 `export const dynamic = "force-dynamic"`** 이라 빌드 타임 프리렌더 대상이 아닙니다:
  - `src/app/account/page.tsx:7`, `src/app/history/page.tsx:5`, `src/app/history/[id]/page.tsx:9` (+ 이번에 추가한 `src/app/search/page.tsx`)
- 해당 페이지들의 Prisma 호출은 `count` / `findUnique` / `findMany` 뿐 → **읽기 전용**.
- **결론: 빌드로 인한 DB 쓰기 가능성은 없습니다.** dev 서버를 잠시 멈출 수 있을 때 안심하고 돌리셔도 됩니다.

### Node 버전

- 작업 시작·종료 시점 모두 **`node -v` = v18.20.8** 이었습니다. Node 24는 아직 PATH에 잡히지 않아 재실행 트리거가 걸리지 않았습니다.
- ESLint 설치 중 `EBADENGINE` 경고(`brace-expansion@5`가 node 20+ 요구)가 떴지만 **동작에는 문제 없음**(lint exit 0). Node 24로 올린 뒤에도 그대로 동작합니다.

---

## 5. 사용자가 직접 할 일

1. **검토 후 커밋** — 미커밋 상태입니다. Eclipse Git Staging / `git status`로 확인 후 직접 커밋하세요.
   되돌리려면: `git checkout -- <파일>` (신규 파일은 `.eslintrc.json`, `src/app/search/SearchClient.tsx`, `tests/`).
2. **`npm run build` 1회 실행** — dev 서버(3000)를 잠깐 내렸다가 돌려보세요. DB 쓰기 없음은 위에서 확인했습니다.
   빌드 후에는 `.next/`가 프로덕션 산출물로 바뀌므로 dev를 다시 띄우면 됩니다.
3. **브라우저로 눈 확인 2건**
   - 창 폭 360~400px에서 헤더에 `분석 / 기록 / 검색`이 한 줄에 들어가는지 (개발자도구 모바일 뷰).
   - 로그인 상태에서 `/search` 진입 → 실제 검색 UI가 뜨는지 (비로그인만 확인했습니다).
4. **Node 24 설치 후** `npm test` / `npm run lint` / `npx tsc --noEmit` 한 번씩 재실행 (18에서만 검증했습니다).

### 다음 작업 (이번에 안 한 것)

- **RAG 하이브리드(RRF) 프로덕션 적용** — `searchChunksPg`에서 pgvector top-30을 가져와 JS bigram 렉시컬 점수와 RRF 융합하는 방식이면 스키마 변경 없이 가능. 단 실제 사용자 데이터로 A/B 검증 필요. (`scripts/eval-hybrid.ts` 기준 top-5 F1 0.25 → 0.30)
- **`next lint` → ESLint CLI 마이그레이션** — Next 16에서 `next lint`가 제거됩니다. `npx @next/codemod@canary next-lint-to-eslint-cli .` (지금은 deprecation 경고만 뜨고 정상 통과하므로 급하지 않음).
- **모바일에서 `/account` 접근성** — `src/components/AuthButtons.tsx:12`의 닉네임 링크가 아직 `hidden sm:inline`이라, 로그인 상태 폰에서는 헤더에 마이페이지 진입점이 없습니다. 이번 지시 범위(#5는 layout.tsx의 분석/검색 링크) 밖이라 남겨뒀습니다.
- **재인덱싱 동시 실행 방지** — #7 수정으로 "실패 시 10분 잠김"은 없앴지만, 진행 중 중복 실행은 여전히 가능. 막으려면 `reindexingAt` 같은 잠금 컬럼(스키마 변경)이 필요합니다.

# yeonae-ai 기능 테스트 보고 (2026-09-16)

> 5개 프로젝트 전체 현황: https://claude.ai/artifact/PvWqAcbkvtL8VSNHZhL48e

## 한 줄 요약: 전체 기능 36개 중 PASS 27 / FAIL 1 / 미실행(과금·쓰기 회피) 8

- 실행 환경: dev 서버 `http://localhost:3000` (기존 기동 상태 그대로 사용), Node 18 + tsx, curl / node fetch.
- 안전 규칙 준수: Anthropic 호출 경로(`/api/analyze` 로그인 후 경로, `claude.ts`) 미실행, 원격 Neon DB에 INSERT/UPDATE 발생 요청 0건, `.env` 값 미열람(키 이름만 확인: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `AUTH_SECRET`, `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`), 소스 미수정, 커밋 없음.
- 테스트 중 dev 서버 로그(`.run.log`)에 error/warn 0건.

## 기능 목록과 결과

| # | 기능 | 종류 | 테스트 방법 | 결과 | 관찰/근거 |
|---|---|---|---|---|---|
| 1 | `/` 랜딩 페이지(비로그인) | 페이지 | curl GET | PASS | 200, "무료로 시작하기"·"먼저 예시 보기"·기능 4카드·약관/개인정보 링크 렌더 |
| 2 | `/` 분석기(로그인 시 `Analyzer` 렌더) | 페이지 | 코드 분석 | 미실행 | `page.tsx`가 `auth()` 세션 있으면 `<Analyzer/>` 반환. 로그인·DB쓰기 필요해 미실행 |
| 3 | `/demo` 데모 분석 페이지 | 페이지 | curl GET | PASS | 200, "데모 모드" 배너 + 입력 폼 + "AI로 분석하기" 버튼(엔드포인트 `/api/demo-analyze`) |
| 4 | `/login` 로그인 페이지 | 페이지 | curl GET | PASS | 200, 카카오 버튼 + 이메일/비번 폼 + 회원가입 링크 |
| 5 | `/signup` 회원가입 페이지 | 페이지 | curl GET | PASS | 200, 닉네임(선택)·이메일·비번(8자 min) 폼, "가입하고 시작하기" |
| 6 | `/history` 기록 목록 | 페이지 | curl GET(비로그인) | PASS | 200, 비로그인 시 "로그인하면 내 분석 기록을 볼 수 있어요" 안내 + 로그인 버튼. 로그인 목록은 미실행 |
| 7 | `/history/[id]` 기록 상세 + 삭제 버튼 | 페이지 | curl GET(비로그인) | PASS | 307 → `/login`. 본인 소유 아니면 `notFound()` 처리(코드). 상세·삭제는 DB 필요해 미실행 |
| 8 | `/search` 히스토리 의미 검색 UI | 페이지 | curl GET | PASS | 200, 검색창·버튼 렌더. 비로그인 게이트 없음(아래 문제 #3) |
| 9 | `/account` 마이페이지 | 페이지 | curl GET(비로그인) | PASS | 307 → `/login`. 로그인 시 오늘 남은 무료횟수/누적 분석/로그아웃(코드) |
| 10 | `/terms` 이용약관 | 페이지 | curl GET | PASS | 200, 제1조~제6조, 시행일 2026-07-31 |
| 11 | `/privacy` 개인정보 처리방침 | 페이지 | curl GET | PASS | 200, 1~6항 |
| 12 | 404 페이지 | 페이지 | curl GET `/nope-404` | PASS | 404 HTML |
| 13 | `GET /api/auth/providers` | 인증 | curl | PASS | `kakao`(oauth) + `credentials`(email) 2개 노출 → 카카오 env 설정됨 |
| 14 | `GET /api/auth/session`, `/api/auth/csrf` | 인증 | curl | PASS | session=`null`(비로그인), csrf 200 |
| 15 | `GET /api/auth/signin` 커스텀 로그인 페이지 리다이렉트 | 인증 | curl | PASS | 302 → `/login?callbackUrl=...` (`pages.signIn` 적용 확인) |
| 16 | `POST /api/auth/register` 입력 검증 | 인증/API | curl POST | PASS | 잘못된 JSON→400, 이메일 형식 오류→400, 비번 7자 이하→400. 모두 DB 조회 이전 분기라 쓰기 없음 |
| 17 | 이메일 회원가입 실제 생성 | 인증 | 코드 분석 | 미실행 | `prisma.user.create` INSERT 발생 → 회피. bcrypt 10라운드, 중복 이메일 409 |
| 18 | Credentials(이메일/비번) 로그인 | 인증 | 코드 분석 | 미실행 | `authorize()`: 소문자 정규화, `passwordHash` null(소셜계정) 거부, bcrypt.compare. JWT 세션 전략 |
| 19 | 카카오 OAuth 로그인 | 인증 | 코드 분석 | 미실행 | 외부 OAuth. `scope=profile_nickname` 명시(KOE004 회피), PrismaAdapter로 User/Account 저장 |
| 20 | `POST /api/analyze` 비로그인 차단 | 분석/인증 | node fetch | PASS | 401 `로그인이 필요해요.` — `auth()`가 body 파싱보다 먼저라 짧은 입력도 401 |
| 21 | `POST /api/analyze` 입력 검증(10자 미만/12,000자 초과/관계메모 200자 초과) | 분석 | 코드 분석 | 미실행 | 검증은 DailyUsage upsert·Claude 호출보다 앞에 있으나 로그인 필요라 미실행 |
| 22 | 하루 3회 무료 제한(DailyUsage 선점) | 분석 | 코드 분석 | 미실행 | Claude 호출 전 `upsert` increment → 초과 시 decrement+429, Claude 실패 시 decrement 환불(502). 원자성 설계 타당 |
| 23 | Claude 분석 서비스(`claude.ts`) | 분석 | 코드 분석 | 미실행(과금) | 모델 `claude-sonnet-5`, adaptive thinking, `output_config.format=json_schema`(Structured Output), `normalize()`로 score 0~100 clamp. tsc 통과로 SDK 0.110 타입 호환 확인 |
| 24 | 키 없을 때 목업 분석 | 분석 | 코드 분석 | 미실행 | `.env`에 키가 존재하므로 목업 경로 안 탐. production이면 throw, dev면 mock |
| 25 | `POST /api/demo-analyze` 샘플 분석 | 분석/API | node fetch | PASS | 200, `id:"demo"`, title 전달/기본값 "데모 분석 (샘플)", rawText 왕복 일치, signals 4·replies 3·nextActions 2. Anthropic·DB 미사용 확인 |
| 26 | `POST /api/demo-analyze` 검증 | API | curl/node | PASS | 10자 미만→400, `{}`→400, 잘못된 JSON→400 |
| 27 | `GET /api/sessions` 목록 | API | curl(비로그인) | PASS | 401 |
| 28 | `GET/DELETE /api/sessions/[id]` | API | curl(비로그인) | PASS | GET 401, DELETE 401. 소유권 불일치 시 404(코드) |
| 29 | `POST /api/rag/search` | 검색/API | node fetch(비로그인) | PASS | 401. k는 1~20 clamp, 2자 미만 400, `searchChunksPg` 파라미터 바인딩 사용(코드) |
| 30 | `POST /api/rag/reindex` | 검색/API | curl(비로그인) | PASS | 401. 사용자별 10분 쿨다운(코드) |
| 31 | POST 전용 라우트에 GET | API | curl | PASS | `/api/analyze`, `/api/demo-analyze`, `/api/rag/search`, `/api/auth/register` 모두 405 |
| 32 | 로컬 임베딩 `embed`/`embedBatch` (@xenova e5-small) | 검색(RAG) | tsx 직접 호출 | PASS | 차원 384 = `EMBEDDING_DIM`, L2 norm 1.0000, NaN 없음. 모델 캐시 있음(`node_modules/@xenova/transformers/.cache`) — 로드+첫 임베딩 2.5s, 4건 배치 120ms |
| 33 | 코사인 유사도 검색(`cosineSimilarity`) | 검색(RAG) | tsx 직접 호출 | PASS | 4문서 corpus에서 "서운했던 순간"→#0, "호감 보인 대화"→#1 정답. "데이트 제안"은 #1(0.830) > 정답 #3(0.805)로 miss(2/3). 점수 대역이 0.79~0.87로 좁음 |
| 34 | 청킹 `chunkConversation` | 검색(RAG) | tsx 직접 호출 | PASS | 40줄 입력→4조각, 최대 480자(≤500), index 연속, overlap 1줄 확인, 빈 입력→0, 700자 한 줄→1조각 |
| 35 | 카톡 내보내기 파서 `parseKakaoExport` | 분석(입력) | tsx 직접 호출 | PASS | iOS/PC `[이름] [오후 3:00]` 형식, Android `2024년/2024. 1. 1.` 형식 모두 "이름: 메시지"로 정규화, 헤더/구분선 제거, 일반 텍스트는 원문 유지 |
| 36 | 평가 스크립트 `eval-rag.ts` / `eval-hybrid.ts` | 검색(RAG) | `npx tsx` 실행 | PASS | eval-rag: top-3 F1 0.40 / top-5 F1 0.38. eval-hybrid(12문제): top-5 임베딩 F1 0.25 vs 하이브리드 0.30 (문서의 "하이브리드 우세" 재현) |
| — | `npx tsc --noEmit` 타입체크 | 빌드 | 실행 | PASS | 오류 0, exit 0 |
| — | `npm run lint` | 빌드 | 실행 | **FAIL** | ESLint 미설치·설정 파일 없음 → 대화형 설정 프롬프트 뜨고 exit 1 (아래 문제 #1) |
| — | DB 모델(User/DailyUsage/Account/Session/VerificationToken/AnalysisSession/ConversationChunk/ReplySuggestion) | DB | 스키마 검토 | 미실행 | `prisma db push`/studio 금지. `embedding_vec`는 `Unsupported("vector(384)")`로 선언만, raw SQL로 관리. Cascade 삭제 체인(User→Session→Chunk) 정합 |
| — | 스크립트 `reindex-rag/setup-pgvector/test-pgvector/test-search/eval-scale` | 스크립트 | 코드 검토 | 미실행 | 앞 4개는 원격 DB 직접 접근(쓰기 포함), eval-scale은 임베딩 ~300회로 수 분 소요라 생략 |

집계(기능 36개 기준): PASS 27 (#1,3~16,20,25~36), FAIL 1(lint), 미실행 8 (#2,17,18,19,21,22,23,24). tsc/DB/스크립트 항목은 참고 행.

## 발견한 버그·문제 (재현법 포함)

1. **`npm run lint` 동작 불가 (FAIL)** — 재현: `npm run lint` → "How would you like to configure ESLint?" 대화형 프롬프트 후 종료(exit 1). 원인: `package.json` devDependencies에 `eslint`/`eslint-config-next` 없음, `.eslintrc*`/`eslint.config.*` 없음. `src/app/account/page.tsx:233`에 `eslint-disable-next-line @next/next/no-img-element` 주석이 있는 걸 보면 lint를 쓰려던 의도. `next build`는 lint 실패를 무시하지 않으므로 CI/Vercel 빌드에서 같은 프롬프트로 멈출 수 있음(비대화형이라 skip될 수도 있으나 확인 필요). 조치: `npm i -D eslint eslint-config-next` + `.eslintrc.json {"extends":"next/core-web-vitals"}` 또는 Next 16 대비 ESLint CLI 마이그레이션.
2. **문서·코드 불일치(모델명)** — README "AI (분석): `claude-opus-4-8`" vs `src/lib/claude.ts:6` `MODEL = "claude-sonnet-5"`. 포트폴리오 문서라 정정 필요.
3. **`/search` 비로그인 게이트 없음** — 재현: 비로그인으로 `/search` 접속 → 페이지 정상 렌더, 검색 시 API 401 응답을 "로그인이 필요해요." 문구로만 표시. `/account`·`/history/[id]`처럼 redirect하거나 `/history`처럼 로그인 안내를 보여주는 게 일관성 있음(client component라 서버 `auth()` 미사용).
4. **데모 페이지 안내 문구 오래됨** — `src/app/demo/page.tsx:331` "Claude API 키가 없으면 예시(목업) 결과가 표시돼요"라고 하지만 `/api/demo-analyze`는 키 유무와 무관하게 항상 고정 샘플을 반환(커밋 72f3b4b에서 전환). 문구 수정 필요. 또 샘플의 `interestLevel: "중간 이상"`은 실제 스키마 enum(매우 높음/높음/보통/낮음/매우 낮음)에 없는 값.
5. **모바일 내비게이션에서 "검색"·"분석하기" 숨김** — `layout.tsx:28,34` `hidden sm:inline`. 폰 폭에서는 `/search`로 가는 링크가 헤더에 없고 `/account`의 "기록 검색" 버튼(이것도 헤더에서 `sm` 이상만 노출되는 닉네임 링크 경유)으로만 도달 가능. 실제 폰에서 검색 기능 발견 어려움.
6. **회원가입 중복 레이스(경미)** — `register/route.ts` `findUnique → create` 사이 원자성 없음. 동시 요청 시 두 번째는 Prisma P2002 unique 에러로 500. `create`를 try/catch해 P2002→409로 매핑 권장.
7. **재인덱싱 쿨다운이 실패해도 소모됨(경미)** — `rag/reindex/route.ts`는 `lastReindexAt`를 작업 전에 갱신하므로 임베딩 중 예외가 나도 10분간 재시도 불가.
8. **카톡 파서 헤더 정규식 과탐(경미)** — `kakao.ts` `HEADER_RE=/(님과 카카오톡 대화|저장한 날짜|저장한 대화)/`가 메시지 본문에 같은 어구가 포함된 줄도 통째로 제거함.
9. **RAG 검색 품질 관찰(버그 아님)** — e5-small은 짧은 한국어 질의에서 유사도 대역이 좁아(0.79~0.87) 순위 뒤집힘이 잦음. 직접 테스트에서 "데이트 제안" 질의가 호감 문서를 1위로 잡았고, 골든셋 F1도 0.3~0.4 수준. 기술회고에 이미 기록된 한계와 일치하며 하이브리드(RRF)가 +0.05 개선 — 프로덕션 `searchChunksPg`에는 아직 하이브리드 미적용.
10. **잡파일** — 프로젝트 루트 `.run.log`(dev 서버 로그)가 untracked 상태. `.gitignore`에 추가 권장.

## 브라우저에서 직접 눌러봐야 할 UI 시나리오 (로그인·과금·DB쓰기 없음)

1. **데모 분석 전체 흐름** — `/demo` → 대화 10자 이상 입력(글자수 카운터 갱신 확인) → "AI로 분석하기" → 점수 게이지 애니메이션(`animate-grow`), 신호 4개 색상, 답장 3개 "복사" 버튼(클립보드→"복사됨!" 1.5초), "새 분석 하기 +"로 초기화. 데모라 "기록에 저장됐어요" 링크가 안 뜨는지 확인.
2. **카톡 .txt 업로드 정규화** — `/demo`에서 "📎 카톡 .txt 올리기"로 iOS/Android 내보내기 샘플 파일 업로드 → textarea에 "이름: 메시지" 형태로 정리되는지, 헤더/날짜 구분선 제거, 2MB 초과 파일 에러 문구, 12,000자 초과 시 뒷부분만 남는지.
3. **데모 입력 검증 UX** — 9자 이하 입력 시 버튼 disabled인지, 서버 400 메시지("대화 내용을 10자 이상…")가 화면에 빨간 박스로 뜨는지(버튼 disabled라 정상적으로는 못 보냄 → 검증 중복 확인).
4. **로그인/회원가입 폼 클라이언트 검증** — `/signup`에서 이메일 형식 오류·비번 7자 입력 시 HTML5 `required/minLength` 검증이 먼저 막는지, 로그인 페이지에서 잘못된 계정으로 제출 시 "이메일 또는 비밀번호가 올바르지 않아요" 표시(단, 이건 DB 읽기 발생·쓰기 없음). 카카오 버튼 클릭 시 `kauth.kakao.com` 동의 화면까지만 확인하고 취소.
5. **반응형 내비게이션** — 창 폭 400px에서 헤더에 "분석하기/검색"이 사라지는지(문제 #5 확인), 랜딩 CTA 버튼이 세로 스택되는지, `/terms`·`/privacy`·404 페이지 레이아웃.

## 환경 한계 / 의도적으로 실행 안 한 것과 이유

- **Anthropic 호출**: `/api/analyze` 로그인 경로, `claude.ts` `analyzeConversation` — 과금 방지. 코드 분석으로만 검증(입력검증→DailyUsage 선점→Claude→저장→인덱싱 순서, 실패 시 환불 로직 확인).
- **원격 Neon DB 쓰기**: 회원가입(`/api/auth/register` 유효 입력), Credentials/카카오 로그인(세션·Account INSERT), 분석 저장, 기록 삭제, `/api/rag/reindex`, `scripts/reindex-rag.ts`·`setup-pgvector.ts` — 모두 미실행. `prisma db push`/`studio`/마이그레이션 미실행.
- **원격 DB 읽기 스크립트**(`test-search.ts`, `test-pgvector.ts`): 읽기 전용이지만 페이지/API 밖의 직접 DB 접근이라 보수적으로 생략. 따라서 `searchChunksPg`(pgvector SQL)와 `searchChunks`(JS) 결과 동일성은 코드로만 확인.
- **로그인 상태 화면**(`/` Analyzer, `/history` 목록/상세, `/account`, `/search` 실제 검색): 로그인 없이는 진입 불가 → 비로그인 응답(200 안내/307/401)만 검증.
- **`eval-scale.ts`**: 무료·로컬이지만 임베딩 ~300회로 수 분 소요라 생략(eval-rag/eval-hybrid로 파이프라인 동작은 확인).
- **브라우저 자동화 도구 미사용**(지시). 클라이언트 상호작용(복사 버튼, 파일 업로드, 애니메이션)은 코드 검토 + 위 "직접 눌러볼 시나리오"로 이관.
- **테스트 아티팩트 주의**: Git Bash `curl -d`로 한글 JSON을 보냈을 때 응답 rawText가 깨져 보였으나 셸 인코딩 문제였고, node fetch로 재시도 시 정상 왕복 확인 — 서버 버그 아님.
- `.env` 값은 읽지 않았고 키 이름만 확인. 카카오 provider가 `/api/auth/providers`에 노출되는 것으로 `AUTH_KAKAO_*` 설정 여부만 간접 확인.

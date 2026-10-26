# 💘 연애 대화 분석 AI (yeonae-ai)

카톡·DM 대화를 붙여 넣으면 상대의 호감도, 답장 추천, 위험 신호, 다음 행동을 정리해 주는 웹 앱입니다.

**누구에게 도움이 되나요?** 썸이나 소개팅 상대와의 대화를 두고 "이 사람 나한테 관심 있나?", "뭐라고 답하지?"를 혼자 고민하는 사람에게, 대화를 한 번 더 객관적으로 읽어 볼 수 있는 참고 자료를 줍니다.

### ▶ [바로 써 보기 (데모)](https://yeomhojun1.github.io/yeonae-ai/)

설치·로그인 없이 브라우저에서 바로 열립니다. 데모는 실제 AI·서버 없이 동작하며, 지어낸 샘플 대화 4개와 미리 준비한 결과를 보여 줍니다. (직접 붙여 넣은 대화는 데모에서 분석되지 않습니다.)

**할 수 있는 것**
- 대화를 넣으면 상대의 관심도를 0~100점으로 보여 줍니다.
- 좋은 신호와 위험 신호(답장이 느려짐, 약속을 미룸 등)를 나눠서 짚어 줍니다.
- 바로 보낼 수 있는 답장 3가지를 말투별로 추천합니다.
- 지금 무엇을 하면 좋을지 다음 행동을 제안합니다.
- 지난 대화 기록을 "서운했던 순간"처럼 뜻으로 검색합니다.

**만든 과정** — AI 코딩 에이전트와 함께 만들고, 기능 테스트로 찾은 문제 10건 중 9건을 고친 뒤 자동 테스트 17개를 추가했습니다([fix-report.md](fix-report.md)). 검색 품질은 정답 목록(골든셋 12문항)으로 측정했고, 키워드+의미 검색을 섞는 방식이 F1 0.25 → 0.30으로 나아지는 것을 확인했습니다. 다만 이 방식은 아직 실서비스 검색에는 적용하지 않았습니다([feature-test-report.md](feature-test-report.md)).

> AI 분석은 참고용입니다. 최종 판단은 본인의 몫이에요.

---

## 개발자용 안내

**[소스 코드](https://github.com/yeomhojun1/yeonae-ai)** · **[▶ 라이브 데모 (GitHub Pages, 정적 데모 모드)](https://yeomhojun1.github.io/yeonae-ai/)**

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1)

<!-- 🔧 스크린샷 2~3장을 docs/ 폴더에 넣고 아래 주석을 해제하세요 (분석 화면 / 결과 화면 / 검색 화면) -->
<!-- ![분석 화면](docs/screenshot-analyze.png) -->
<!-- ![검색 화면](docs/screenshot-search.png) -->

---

## 🎯 한눈에 보기 (엔지니어링 관점)

개인 학습용 토이가 아니라 **인증·DB·배포까지 갖춘 실동작 서비스**로, AI 앱 엔지니어링의 핵심 난제들을 직접 다뤘습니다.

| 다룬 문제 | 어떻게 풀었나 | 관련 파일 |
| --- | --- | --- |
| **LLM 출력을 믿을 수 있게** | Structured Outputs(JSON 스키마 강제)로 분석 결과를 타입 안전한 데이터로 | `src/lib/claude.ts` |
| **긴 대화 히스토리 검색** | RAG(청킹→임베딩→벡터검색)로 "의미로 찾기" 구현 | `src/lib/{chunk,embeddings,rag}.ts` |
| **검색 품질을 감으로 판단하지 않기** | 골든셋 평가 파이프라인(Recall/Precision/F1)으로 측정 기반 개선 | `scripts/eval-*.ts` |
| **데이터가 커져도 빠르게** | JS 코사인 검색 → **pgvector(HNSW 색인)** 프로덕션화 | `src/lib/rag.ts`, `scripts/setup-pgvector.ts` |
| **API 비용 통제** | 임베딩을 **로컬 모델**로 처리해 검색 비용 0원, 분석은 사용량 제한 | `src/lib/embeddings.ts` |

자세한 내용은 아래 [기술적 하이라이트](#-기술적-하이라이트)를 참고하세요.

---

## ✨ 주요 기능

- **카카오 로그인** & 사용자별 분석 기록
- 대화 텍스트 붙여넣기 → AI 분석
- 상대방 호감도 / 대화 흐름 **점수화 (0~100)**
- **답장 3개 추천** (톤별)
- 긍정 / 위험 / 참고 **신호 분석**
- **다음 행동** 추천
- 분석 기록 **저장 / 조회 / 삭제**
- **히스토리 의미 검색 (RAG)** — "서운했던 순간", "읽씹당한 패턴"처럼 **뜻으로** 지난 대화 검색
- 하루 3회 무료 분석 제한 (사용자별)

## 🧱 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| 스타일 | Tailwind CSS |
| DB | PostgreSQL + **pgvector** (벡터 검색) + Prisma ORM |
| 인증 | Auth.js (NextAuth v5) · 카카오 OAuth |
| AI (분석) | Anthropic Claude API (`claude-sonnet-5`, structured outputs) |
| AI (검색) | `@xenova/transformers` · `multilingual-e5-small` (384차원 임베딩, **로컬 실행**) |

## 🔬 기술적 하이라이트

### 1. Structured Outputs — LLM을 신뢰 가능한 함수로
분석 결과를 자유 텍스트가 아니라 **JSON 스키마로 강제**했습니다(`score`는 정수 0~100, `interestLevel`은 enum, 신호는 `positive/negative/neutral`). LLM 응답을 파싱 오류 없이 타입 안전하게 화면·DB로 흘려보냅니다. → `src/lib/claude.ts`

### 2. RAG — 청킹·임베딩·의미 검색
- **청킹**: 대화를 맥락이 끊기지 않게 겹침(overlap)을 두고 조각화 → `src/lib/chunk.ts`
- **임베딩**: e5 모델로 문장을 384차원 의미 벡터로. 무거운 모델은 싱글턴으로 1회만 로드 → `src/lib/embeddings.ts`
- **검색**: 질문을 같은 모델로 임베딩해 코사인 최근접 조각을 검색 → `src/lib/rag.ts`

### 3. 측정 기반 개선 — "가정하지 말고 측정하라"
검색 품질을 **골든셋(정답 라벨)** 으로 계량화하고, 개선안을 실험으로 검증했습니다.
- `scripts/eval-rag.ts` — Recall@k / Precision@k / F1 측정
- `scripts/eval-hybrid.ts` — 임베딩 단독 vs **하이브리드(키워드 + 임베딩, RRF 융합)** 비교
- `scripts/eval-scale.ts` — 카테고리 템플릿으로 대화 200여 개·질문 100여 개를 생성해 대규모 비교

> **배운 것**: "그럴듯한 개선"이 측정해보면 본전이거나 악화되기도 했고, **골든셋 크기가 결론을 바꿨습니다**(3문제→"본전", 12문제→"개선"). 최적 검색법은 데이터마다 달랐습니다.

### 4. pgvector 프로덕션화 — 확장을 위한 마이그레이션
학습용 JS 코사인 검색(모든 조각을 앱으로 로드)을 **DB 내부 벡터 검색**으로 전환했습니다.
- `vector(384)` 컬럼 + **HNSW 코사인 색인**, `<=>` 연산자로 최근접 검색 → `src/lib/rag.ts`의 `searchChunksPg`
- 기존 데이터 **백필** 및 색인 생성 일회성 스크립트 → `scripts/setup-pgvector.ts`
- 마이그레이션 전후 **결과 동일성 검증**으로 안전하게 교체

### 5. 비용 의식적 설계
임베딩·검색을 **로컬 모델**로 처리해 반복 검색 비용을 0원으로 만들고, 유료 LLM 호출(분석)에는 사용량 제한을 둬 비용을 통제했습니다.

---

## 📁 폴더 구조

```
yeonae-ai/
├─ prisma/
│  └─ schema.prisma          # User/Account/Session + AnalysisSession/ConversationChunk/ReplySuggestion
├─ src/
│  ├─ auth.ts                # Auth.js(NextAuth) 설정 (카카오)
│  ├─ app/
│  │  ├─ page.tsx            # 메인: 로그인 게이트 + 분석
│  │  ├─ login/              # 로그인 페이지
│  │  ├─ search/             # 히스토리 의미 검색 UI (RAG)
│  │  ├─ history/            # 내 분석 기록 목록 / 상세
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/  # Auth.js 핸들러
│  │     ├─ analyze/         # POST 분석 실행 (로그인 필요)
│  │     ├─ rag/search/      # POST 의미 검색
│  │     ├─ rag/reindex/     # POST 임베딩 재색인
│  │     └─ sessions/        # GET 목록 / GET·DELETE 단건 (본인 것만)
│  ├─ components/
│  │  ├─ Analyzer.tsx        # 대화 입력/분석 UI
│  │  ├─ AnalysisView.tsx    # 결과 렌더링
│  │  └─ AuthButtons.tsx     # 로그인/로그아웃 버튼
│  └─ lib/
│     ├─ claude.ts           # Claude 분석 서비스 + Structured Outputs 스키마
│     ├─ chunk.ts            # 청킹 (겹침 포함)
│     ├─ embeddings.ts       # 로컬 임베딩(e5) + 코사인 유사도
│     ├─ rag.ts              # 저장/검색 (JS 코사인 · pgvector 두 구현)
│     ├─ prisma.ts           # Prisma 클라이언트
│     └─ types.ts            # 공용 타입
├─ scripts/                  # 평가(eval-*) · pgvector 셋업 · 재색인 스크립트
└─ .env.example
```

## 🚀 로컬 실행 방법

### 1. 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env` 를 만들고 값을 채워주세요.

```bash
cp .env.example .env
```

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 접속 주소. 로컬 또는 [Neon](https://neon.tech)·[Supabase](https://supabase.com) 무료 DB |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) 발급. **비우면 목업(예시) 결과로 동작** |
| `AUTH_SECRET` | 세션 암호화 키. `npx auth secret` 로 생성 |
| `AUTH_KAKAO_ID` | 카카오 앱 **REST API 키** |
| `AUTH_KAKAO_SECRET` | 카카오 앱 **Client Secret** |

### 3. 카카오 로그인 설정

1. [Kakao Developers](https://developers.kakao.com) → 애플리케이션 추가
2. **앱 키 > REST API 키** → `AUTH_KAKAO_ID`
3. **보안 > Client Secret** 발급 → `AUTH_KAKAO_SECRET`
4. **카카오 로그인** 활성화 후 **Redirect URI** 등록:
   - 로컬: `http://localhost:3000/api/auth/callback/kakao`
   - 배포: `https://<your-domain>/api/auth/callback/kakao`
5. (선택) **동의 항목**에서 닉네임/프로필 사진 동의 설정

### 4. DB 스키마 반영 & 실행

```bash
npm run db:push                        # DB에 테이블 생성
npx tsx scripts/setup-pgvector.ts      # pgvector 확장·벡터컬럼·HNSW 색인·백필 (최초 1회)
npm run dev                            # http://localhost:3000
```

### 5. (선택) 검색 품질 측정 — 무료·로컬

```bash
npx tsx scripts/eval-rag.ts       # 골든셋으로 Recall/Precision/F1
npx tsx scripts/eval-hybrid.ts    # 임베딩 vs 하이브리드 비교
```

## 🗄️ 데이터베이스 스키마

- `User` / `Account` / `Session` — Auth.js 표준 인증 테이블
- `AnalysisSession` — 분석 세션 (userId, title, raw_text, result_json, score)
- `ConversationChunk` — 대화 조각 + 임베딩 (`embedding` Float[] / `embedding_vec` **pgvector(384)**) — RAG 검색용
- `ReplySuggestion` — 추천 답장 (sessionId, tone, content)

## ☁️ 배포 (Vercel)

1. 이 저장소를 GitHub에 푸시
2. [Vercel](https://vercel.com) → **Add New → Project** → 저장소 Import
3. **Environment Variables** 에 다음 등록:
   - `DATABASE_URL` (프로덕션 Postgres)
   - `ANTHROPIC_API_KEY`
   - `AUTH_SECRET`
   - `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`
   - *(Vercel에서는 `AUTH_URL`/`AUTH_TRUST_HOST` 자동 처리)*
4. 카카오 Redirect URI에 배포 도메인 추가:
   `https://<프로젝트>.vercel.app/api/auth/callback/kakao`
5. **Deploy**
6. 최초 1회 프로덕션 DB에 스키마 반영:
   ```bash
   # 로컬에서 .env의 DATABASE_URL을 프로덕션 DB로 두고 실행
   npx prisma db push
   ```

> 빌드 커맨드는 `package.json`의 `build`(= `prisma generate && next build`)를 그대로 사용합니다. 별도 설정 불필요.

## 🧪 정적 데모 (GitHub Pages)

`NEXT_PUBLIC_DEMO=true`로 빌드하면 서버·DB·AI 없이 브라우저 안에서만 동작하는 정적 데모가 `out/`에 만들어집니다.

- `next.config.mjs`가 데모 빌드에서만 `output: "export"`, `basePath: "/yeonae-ai"`, `pageExtensions: ["demo.tsx", "demo.ts"]`를 켭니다. 그래서 `src/app` 아래 `*.demo.tsx`만 라우트가 되고, API 라우트와 로그인 의존 페이지는 데모 빌드에서 빠집니다. 평소 빌드에서는 `*.demo.tsx`가 라우트로 인식되지 않습니다.
- 샘플 대화·분석 결과: `src/lib/demo/samples.ts` (지어낸 대화, 분석 결과는 스키마에 맞춰 사람이 작성한 예시)
- 검색 결과: `src/lib/demo/search-results.json` — `npx tsx scripts/build-demo-search.ts`로 로컬 임베딩 모델을 돌려 미리 계산 (샘플이 짧아 조각 크기만 120자로 줄임)
- 배포: `.github/workflows/pages.yml` (main 푸시 시 데모 빌드 → Pages 배포)

```bash
# 로컬에서 데모 빌드 (bash)
NEXT_PUBLIC_DEMO=true npx next build   # 결과: out/
```

## 💰 수익 모델 (예정)

- 무료: 하루 3회 분석 (현재 적용됨)
- 유료: 무제한 분석, 고급 답장, 장기 흐름 분석 (월 4,900원~14,900원)

## ⚠️ 개인정보 안내

- 입력한 대화는 분석 목적으로만 사용됩니다.
- 실제 서비스 배포 시 개인정보 처리방침 및 스토어 심사 정책을 반드시 확인하세요.

---

## 📌 로드맵 (다음 단계)

- [x] 카카오 로그인 + 사용자별 기록
- [ ] 대화 이미지(캡처) 업로드 & OCR
- [ ] 장기 관계 흐름 추적 (여러 세션 비교)
- [ ] 유료 결제 연동

# 💘 연애 대화 분석 AI (yeonae-ai)

카톡·DM 대화, 소개팅·썸 상황을 붙여넣으면 AI가 **호감도, 답장 추천, 위험 신호, 다음 행동**을 분석해주는 웹 앱입니다.

> AI 분석은 참고용입니다. 최종 판단은 본인의 몫이에요.

---

## ✨ 주요 기능

- **카카오 로그인** & 사용자별 분석 기록
- 대화 텍스트 붙여넣기 → AI 분석
- 상대방 호감도 / 대화 흐름 **점수화 (0~100)**
- **답장 3개 추천** (톤별)
- 긍정 / 위험 / 참고 **신호 분석**
- **다음 행동** 추천
- 분석 기록 **저장 / 조회 / 삭제**
- 하루 3회 무료 분석 제한 (사용자별)

## 🧱 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| 스타일 | Tailwind CSS |
| DB | PostgreSQL + Prisma ORM |
| 인증 | Auth.js (NextAuth v5) · 카카오 OAuth |
| AI | Anthropic Claude API (`claude-opus-4-8`, structured outputs) |

## 📁 폴더 구조

```
yeonae-ai/
├─ prisma/
│  └─ schema.prisma          # User/Account/Session + AnalysisSession/ReplySuggestion
├─ src/
│  ├─ auth.ts                # Auth.js(NextAuth) 설정 (카카오)
│  ├─ app/
│  │  ├─ page.tsx            # 메인: 로그인 게이트 + 분석
│  │  ├─ login/              # 로그인 페이지
│  │  ├─ history/            # 내 분석 기록 목록 / 상세
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/  # Auth.js 핸들러
│  │     ├─ analyze/         # POST 분석 실행 (로그인 필요)
│  │     └─ sessions/        # GET 목록 / GET·DELETE 단건 (본인 것만)
│  ├─ components/
│  │  ├─ Analyzer.tsx        # 대화 입력/분석 UI
│  │  ├─ AnalysisView.tsx    # 결과 렌더링
│  │  └─ AuthButtons.tsx     # 로그인/로그아웃 버튼
│  └─ lib/
│     ├─ claude.ts           # Claude 분석 서비스 (핵심)
│     ├─ prisma.ts           # Prisma 클라이언트
│     └─ types.ts            # 공용 타입
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
npm run db:push     # DB에 테이블 생성
npm run dev         # http://localhost:3000
```

## 🗄️ 데이터베이스 스키마

- `User` / `Account` / `Session` — Auth.js 표준 인증 테이블
- `AnalysisSession` — 분석 세션 (userId, title, raw_text, result_json, score)
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

# 💘 연애 대화 분석 AI (yeonae-ai)

카톡·DM 대화, 소개팅·썸 상황을 붙여넣으면 AI가 **호감도, 답장 추천, 위험 신호, 다음 행동**을 분석해주는 웹 앱입니다.

> AI 분석은 참고용입니다. 최종 판단은 본인의 몫이에요.

---

## ✨ 주요 기능 (MVP)

- 대화 텍스트 붙여넣기 → AI 분석
- 상대방 호감도 / 대화 흐름 **점수화 (0~100)**
- **답장 3개 추천** (톤별)
- 긍정 / 위험 / 참고 **신호 분석**
- **다음 행동** 추천
- **분석 기록 저장 / 조회 / 삭제**

## 🧱 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| 스타일 | Tailwind CSS |
| DB | PostgreSQL + Prisma ORM |
| AI | Anthropic Claude API (`claude-opus-4-8`, structured outputs) |

## 📁 폴더 구조

```
yeonae-ai/
├─ prisma/
│  └─ schema.prisma        # User / AnalysisSession / ReplySuggestion
├─ src/
│  ├─ app/
│  │  ├─ page.tsx          # 메인: 대화 입력 & 분석
│  │  ├─ history/          # 분석 기록 목록 / 상세
│  │  └─ api/
│  │     ├─ analyze/       # POST 분석 실행
│  │     └─ sessions/      # GET 목록 / GET·DELETE 단건
│  ├─ components/
│  │  └─ AnalysisView.tsx  # 결과 렌더링
│  └─ lib/
│     ├─ claude.ts         # Claude 분석 서비스 (핵심)
│     ├─ prisma.ts         # Prisma 클라이언트
│     └─ types.ts          # 공용 타입
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

- `DATABASE_URL` : PostgreSQL 접속 주소
  - 로컬 Postgres 또는 [Neon](https://neon.tech)·[Supabase](https://supabase.com) 같은 무료 클라우드 DB 사용
- `ANTHROPIC_API_KEY` : [console.anthropic.com](https://console.anthropic.com) 에서 발급
  - **비워두면** 실제 호출 없이 **목업(예시) 분석 결과**로 동작합니다 (화면 확인용)

### 3. DB 스키마 반영

```bash
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:3000

## 🗄️ 데이터베이스 스키마

```
users
  - id, email, provider, created_at

analysis_sessions
  - id, user_id, title, raw_text, result_json, score, created_at

reply_suggestions
  - id, session_id, tone, content
```

## 💰 수익 모델 (예정)

- 무료: 하루 3회 분석 (현재 적용됨)
- 유료: 무제한 분석, 고급 답장, 장기 흐름 분석 (월 4,900원~14,900원)

## ☁️ 배포 (Vercel)

1. 이 저장소를 GitHub에 푸시
2. [Vercel](https://vercel.com) 에서 Import
3. 환경변수(`DATABASE_URL`, `ANTHROPIC_API_KEY`) 설정
4. Deploy

## ⚠️ 개인정보 안내

- 입력한 대화는 분석 목적으로만 사용됩니다.
- 실제 서비스 배포 시 개인정보 처리방침 및 앱스토어/스토어 심사 정책을 반드시 확인하세요.

---

## 📌 로드맵 (다음 단계)

- [ ] 소셜 로그인 (kakao/google) + 사용자별 기록
- [ ] 대화 이미지(캡처) 업로드 & OCR
- [ ] 장기 관계 흐름 추적 (여러 세션 비교)
- [ ] 유료 결제 연동

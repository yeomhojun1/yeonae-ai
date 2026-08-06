# 💘 연애시장 AI 앱 — 프로젝트 정리

> 카톡/DM 대화, 소개팅·썸 상황을 입력하면 AI가 **호감도, 답장 추천, 위험 신호, 다음 행동**을 분석해주는 앱.
> 최종 업데이트: 2026-07 · GitHub: https://github.com/yeomhojun1/yeonae-ai · 로컬: `c:\yeonae-ai`

---

## 1. 개요 & 컨셉

AI를 연애 감정의 대체재로 쓰는 건 거부감이 있지만, **프로필 개선·데이트 코스·메시지 작성 같은 보조도구**는 수요가 있다. 이 앱은 대화 분석 + 답장 추천에 집중한 보조 도구.

**타깃 사용 시나리오**: "이 대화 상대가 나한테 관심 있나?", "이렇게 답장해도 되나?", "다음에 뭐 하지?"

---

## 2. 핵심 기능

- 대화 캡처/텍스트 업로드 → AI 분석
- 상대방 **호감도 분석** (0~100 점수화)
- 내 **답장 추천** (톤별 3개)
- 관계 흐름 변화 분석 / 위험 신호 감지
- 다음 행동 추천
- (향후) 소개팅·데이트 코스 추천, 프로필 문구 개선, "이거 보내도 됨?" 체크

### MVP 범위 (현재 구현됨 ✅)
- [x] 대화 텍스트 붙여넣기
- [x] AI 분석 결과 출력 (호감도/신호/요약)
- [x] 답장 3개 추천
- [x] 대화 흐름 점수화
- [x] 분석 기록 저장 / 조회 / 삭제
- [x] 카카오 로그인 + 사용자별 기록
- [x] 하루 3회 무료 제한(사용자별)

---

## 3. 현재 구현 상태

| 항목 | 상태 | 비고 |
|---|---|---|
| Next.js 풀스택 앱 | ✅ 완료 | App Router, 빌드 통과 |
| Claude API 분석 | ✅ 완료 | `claude-opus-4-8`, structured outputs. 키 없으면 목업 결과 |
| DB (PostgreSQL) | ✅ 완료 | **Neon 클라우드** 연결, `db push` 완료 |
| 카카오 로그인 | ✅ 동작 확인 | Auth.js(next-auth v5) |
| 분석→기록 저장 | ✅ 동작 | 로그인 사용자별로 Neon에 저장 |
| GitHub 업로드 | ✅ 완료 | main 브랜치 push됨 |
| Vercel 배포 | ⬜ 미완 | 다음 작업 |
| 실제 Claude 키 연결 | ⬜ 미완 | `.env`에 `ANTHROPIC_API_KEY` 넣으면 실제 분석 |

> **로컬 전용(미커밋) 요소**: `.env`(Neon URL·카카오 키·AUTH_SECRET), 데모 모드 파일(`/demo`, `/api/demo-analyze`) — 로그인/DB 없이 UI만 볼 때 사용. GitHub엔 올리지 않음.

---

## 4. 기술 스택 & 아키텍처

```
Client (Next.js React)
  ↓
Next.js API Routes  (/api/analyze, /api/sessions, /api/auth)
  ↓
Auth (Auth.js + Kakao)  /  Chat Analysis Service (lib/claude.ts)
  ↓
Claude API  /  Prisma
  ↓
PostgreSQL (Neon)
```

| 구분 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| 스타일 | Tailwind CSS |
| DB | PostgreSQL(Neon) + Prisma ORM |
| 인증 | Auth.js (NextAuth v5) · 카카오 OAuth |
| AI | Anthropic Claude API (`claude-opus-4-8`) |

### 주요 파일
- `src/lib/claude.ts` — Claude 분석 로직(핵심). 키 없으면 목업.
- `src/auth.ts` — 카카오 로그인 설정
- `src/app/api/analyze/route.ts` — 분석 실행(로그인 필요, DB 저장)
- `src/app/page.tsx` / `src/components/Analyzer.tsx` — 입력·분석 UI
- `src/app/history/` — 기록 목록·상세
- `prisma/schema.prisma` — DB 스키마

---

## 5. DB 스키마

- `User` / `Account` / `Session` — Auth.js 표준 인증 테이블
- `AnalysisSession` — 분석 세션 (userId, title, rawText, resultJson, score, createdAt)
- `ReplySuggestion` — 추천 답장 (sessionId, tone, content)

---

## 6. 로컬 실행 방법

```bash
cd c:\yeonae-ai
npm install
# .env 준비 (아래 6-1 참고)
npm run db:push      # Neon에 테이블 생성
npm run dev          # http://localhost:3000
```

### 6-1. .env 필요 값
```
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
ANTHROPIC_API_KEY=""          # 비우면 목업 결과. 넣으면 실제 Claude 분석
AUTH_SECRET="..."             # npx auth secret 로 생성
AUTH_KAKAO_ID="..."           # 카카오 REST API 키
AUTH_KAKAO_SECRET="..."       # 카카오 로그인 Client Secret
```

---

## 7. ⚠️ 카카오 로그인 설정 (많이 헤맴 — 꼭 기억)

개편된 카카오 개발자 콘솔 기준.

1. [developers.kakao.com](https://developers.kakao.com) → 앱 생성
2. **카카오 로그인 > 사용 설정 ON**
3. **카카오 로그인 > 동의항목 > 닉네임** 켜기 (이메일은 비즈니스 검수 필요 → 안 씀)
4. **플랫폼 키 > REST API 키 > 클라이언트 시크릿**: Client Secret 생성 + **활성화 ON** → `AUTH_KAKAO_SECRET`
5. REST API 키 값 → `AUTH_KAKAO_ID`
6. **★ Redirect URI 등록 위치 (가장 헷갈림)**:
   개편 후 "카카오 로그인 > 일반"엔 **없음**. → **`앱 > 플랫폼 키 > REST API 키(Default Rest API Key) 클릭 > 상세`** 안의 **"카카오 로그인 리다이렉트 URI"** 칸에 입력:
   ```
   http://localhost:3000/api/auth/callback/kakao
   ```
   **`+` 버튼으로 추가 후 저장** (`+` 안 누르면 저장 안 됨). http, 포트 포함, 끝 슬래시 없음.

### 에러 코드
- **KOE006** = Redirect URI 미등록/불일치 → 위 위치에 정확히 등록.
- **KOE004** = 동의항목/scope/활성화 문제.

### Auth.js Kakao provider 빈 scope 버그
기본 provider가 빈 scope(`?scope`)를 보내 KOE004 유발. `src/auth.ts`에서 url까지 명시:
```ts
Kakao({
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: { scope: "profile_nickname" },
  },
})
```
(`params`만 주면 base url이 사라져 `Invalid URL` 에러 → url 반드시 포함)

---

## 8. 수익 모델

- 무료: 하루 3회 분석 (현재 적용됨)
- 유료: 무제한 분석, 고급 답장, 장기 흐름 분석 — 월 4,900~14,900원

---

## 9. 남은 작업 / 로드맵

- [ ] **실제 Claude 키 연결** (`ANTHROPIC_API_KEY`) — 지금은 목업 결과
- [ ] **Vercel 배포** (환경변수 등록 + 배포 도메인용 카카오 Redirect URI 추가)
- [ ] 대화 캡처 **이미지 업로드 & OCR**
- [ ] 장기 관계 흐름 추적(여러 세션 비교)
- [ ] 유료 결제 연동
- [ ] 소개팅/데이트 코스 추천, 프로필 문구 개선 기능

---

## 10. 주의사항

- 입력 대화는 **개인정보**라 민감 → 실제 서비스 시 개인정보 처리방침 필수
- AI 답장이 티 나면 반감 → 자연스러움 유지
- 분석 정확도 과신 금지 (참고용 안내 유지)
- 앱스토어/스토어 심사 정책 확인

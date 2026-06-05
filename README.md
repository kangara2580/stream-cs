# 🎮 스트림컨텐츠 서버 (StreamContent Server)

> **"OBS/모바일 링크 한 줄로 모든 플랫폼 스트리머의 컨텐츠 고갈과 수금 문제를 동시에 해결하는 가성비 크로스플랫폼 SaaS"**

---

## 📁 프로젝트 구조

```
stream-cs/
├── public/
│   ├── index.html           ← 대시보드 + WebSocket 클라이언트
│   ├── overlay/
│   │   ├── overlay.html     ← OBS 메인 오버레이 (1920×1080)
│   │   └── face-overlay.html← 얼굴 인식 오버레이 (음식/면 먹기)
│   └── supabase-config.js   ← 로컬 전용 (gitignore)
├── ws-server/               ← WebSocket + Twitch IRC 실시간 서버
│   ├── server.js
│   └── modules/
├── app/layout.tsx
├── middleware.ts            ← `/` → `/index.html` 리라이트
└── package.json
```

---

## 🚀 로컬 개발

```bash
cd /Users/gang-ahra/stream-cs
npm run dev
```

브라우저: **http://localhost:3000** (또는 터미널에 표시된 포트)

### 실시간 서버 (WebSocket + 채팅)

```bash
npm run ws:install   # 최초 1회
cp ws-server/.env.example ws-server/.env   # SUPABASE_SERVICE_KEY 등 입력

# 터미널 1 — 대시보드
npm run dev

# 터미널 2 — WebSocket 서버
npm run ws:dev
```

**OBS 브라우저 소스 URL (로컬):**

`http://localhost:3000/overlay/overlay.html?key=YOUR_KEY&server=ws://localhost:3001`

대시보드 → 스트리머 설정 → 실시간 서버 연결에서 WS URL 저장 후 **OBS URL 복사** 버튼 사용.

프로덕션: 대시보드는 Vercel, WebSocket 서버는 Railway/Render 등에 `ws-server` 배포.

UI 수정은 **`public/index.html`** (대시보드) 또는 **`public/overlay/`** (OBS) 를 편집합니다.

### Supabase 백엔드 연동

1. [docs/SUPABASE_연동가이드.md](docs/SUPABASE_연동가이드.md) 순서대로 진행
2. `supabase/schema.sql` → Supabase SQL Editor에서 실행
3. `public/supabase-config.example.js` → `public/supabase-config.js` 복사 후 URL·anon key 입력

키 없이도 **데모 모드**로 UI는 동작합니다 (가입/로그인은 흉내, DB 저장 없음).

---

## 🚀 현재 단계: HTML 프로토타입 (MVP UI)

`public/index.html` 하나에 5개 페이지가 모두 담겨 있어:
- **랜딩 페이지** — 마케팅, 요금제, 수익 계산기
- **로그인/회원가입** — 이메일 + 카카오/구글 소셜 로그인 UI
- **대시보드** — 오버레이 관리, OBS URL 복사, 활동 피드
- **OBS 오버레이** — 폭탄 룰렛 실시간 데모 (투명 배경)
- **시청자 참여 페이지** — 룰렛 참여 + 출석체크 (모바일 최적화)

---

## 🎨 디자인 시스템

- **메인 컬러**: `#FFD600` (노란색 고정)
- **폰트**: Jua (헤딩) + Noto Sans KR (본문)
- **테마**: 동글동글 귀여운 라이트 모드
- **반응형**: 모바일(9:16) + PC(16:9) 모두 지원

---

## 🌐 지원 플랫폼

| 플랫폼 | 연동 방식 |
|--------|---------|
| 치지직 | OBS 브라우저 소스 |
| SOOP (아프리카TV) | PC/모바일 웹 오버레이 |
| 틱톡 라이브 | 모바일 웹 오버레이 |
| 팝콘TV | OBS 브라우저 소스 |
| Prism Live Studio | 모바일 웹 오버레이 |

---

## 💰 비즈니스 모델

| 플랜 | 가격 | 특징 |
|------|------|------|
| Basic | 월 19,000원 | 단일 플랫폼, 50명 제한 |
| Premium | 월 49,000원 | 멀티 플랫폼, 무제한, AI 게임 |

**수익성**: 구독자 100명 기준 월 순수익 485만원 (마진율 98%+)

---

## 🛠️ 다음 단계 (Next.js 마이그레이션)

```bash
# 1. Next.js 프로젝트 초기화
npx create-next-app@latest streamcontent --typescript --tailwind --app

# 2. Supabase 설치
npm install @supabase/supabase-js @supabase/ssr

# 3. Stripe 설치
npm install stripe @stripe/stripe-js

# 4. shadcn/ui 설치
npx shadcn-ui@latest init
```

### Supabase DB 스키마
```sql
-- streamers 테이블
create table streamers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  channel_name text,
  overlay_key text unique default gen_random_uuid()::text,
  plan text default 'basic',
  created_at timestamptz default now()
);

-- sessions 테이블 (오버레이 세션)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  streamer_id uuid references streamers(id),
  type text, -- 'roulette' | 'checkin' | 'balance'
  config jsonb,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- participants 테이블
create table participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),
  nickname text,
  score integer default 0,
  joined_at timestamptz default now()
);
```

---

## 📋 개발 일정 (2주 완성 목표)

- **Day 1~2**: Supabase 인증 + DB 세팅
- **Day 3~5**: 폭탄 룰렛 실시간 컴포넌트 (Supabase Realtime)
- **Day 6~7**: 대시보드 + OBS URL 생성 연동
- **Day 8~10**: 시청자 참여 모바일 페이지
- **Day 11~14**: 결제(Stripe) + 멀티플랫폼 테스트 + 런칭

---

## ⚠️ 핵심 리스크 대책

1. **플랫폼별 도네이션 API**: 직접 연동 대신 "시청자 직접 참여형 웹뷰" 방식으로 우회
2. **모바일 웹뷰 호환성**: 절대값(px) 대신 상대값(vw/vh) 사용, 가벼운 CSS 애니메이션
3. **실시간 트래픽 폭주**: Supabase Realtime + 디바운싱(1~2초 배치 처리) 적용

---

*1인 개발 · 100% 지분 · Made with ☕ + Cursor*

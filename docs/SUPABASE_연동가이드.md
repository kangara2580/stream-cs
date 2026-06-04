# StreamCS 백엔드 연동 가이드 (Supabase)

이 문서는 비개발자도 따라할 수 있게 만든 Supabase 연동 안내입니다.
순서대로 따라하면 회원가입·로그인·구독·게임기록 저장이 실제로 작동합니다.

---

## 1단계 — Supabase 프로젝트 만들기

1. https://supabase.com 접속 → 가입 (GitHub 계정으로 하면 편해요)
2. **New project** 클릭
3. 프로젝트 이름(예: `streamcs`), 비밀번호 입력 → 생성
4. 생성까지 1~2분 기다리기

---

## 2단계 — 데이터베이스 테이블 만들기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. 프로젝트의 `supabase/schema.sql` 파일 내용을 전부 복사
3. SQL Editor에 붙여넣고 오른쪽 아래 **Run** 클릭
4. "Success" 가 뜨면 완료 — 회원정보·게임기록·구독·설정 테이블이 만들어졌어요

---

## 3단계 — 내 프로젝트 키 가져오기

1. 왼쪽 메뉴 맨 아래 **Project Settings** (톱니바퀴) → **API**
2. 두 가지를 복사해두세요:
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **anon public** 키 (긴 문자열)

---

## 4단계 — Supabase 키 입력

1. `public/supabase-config.example.js` 를 복사해서 **`public/supabase-config.js`** 로 저장
2. 3단계에서 복사한 값으로 수정:

```javascript
window.STREAMCS_SUPABASE = {
  url: "https://abcd1234.supabase.co",
  anonKey: "eyJhbGci....(복사한 anon 키)",
};
```

3. 개발 서버 재시작 (`npm run dev`) 후 브라우저 새로고침

저장하면 끝! 이제 회원가입/로그인/구독/게임기록/방송설정이 Supabase에 저장됩니다.

> `supabase-config.js` 는 Git에 올라가지 않도록 `.gitignore` 처리되어 있습니다.

> 키를 입력하지 않아도 사이트는 **데모 모드**로 잘 작동해요.
> (가입/로그인 흉내만 내고 실제 저장은 안 함 — 디자인 확인용)

---

## 5단계 — 카카오 / 구글 소셜 로그인 켜기 (선택)

1. Supabase → **Authentication** → **Providers**
2. **Google**, **Kakao** 를 각각 켜고(Enable), 해당 플랫폼에서 발급받은
   Client ID / Secret 을 입력
   - 구글: https://console.cloud.google.com → OAuth 동의화면 + 사용자 인증정보
   - 카카오: https://developers.kakao.com → 내 애플리케이션 → 카카오 로그인
3. **Redirect URL** 에 Supabase가 알려주는 주소를 그대로 등록

---

## 데이터가 어떻게 저장되나요?

| 테이블 | 저장되는 정보 |
|---|---|
| `profiles` | 회원 채널명, 이메일, **구독 플랜**, 오버레이 키 |
| `game_records` | 어떤 게임을 언제 했는지 기록 |
| `subscriptions` | 구독/결제 내역 |
| `overlay_settings` | 방송 연동·게임 기본 설정 |

모든 테이블은 **RLS(보안)**가 걸려 있어, 로그인한 본인 데이터만 보고
수정할 수 있습니다. (다른 사람이 내 정보를 볼 수 없음)

---

## 접근 제어 동작 방식

이 사이트는 **로그인 + 구독한 사람만** 게임을 쓸 수 있게 만들어졌어요:

- **로그인 안 함** → 대시보드/설정 진입 시 로그인 페이지로 보냄
- **로그인 O, 구독 X** → 게임 시작 시 "구독 후 이용" 안내, 게임 1종만 체험
- **Starter 구독** → 게임 3종 사용 가능
- **Pro 구독** → 전체 게임 + AI 게임 + 멀티 플랫폼

게임 목록에서 못 쓰는 게임은 자물쇠(구독 필요 / Pro 전용) 배지가 표시됩니다.

---

## 실제 결제 연동 (나중에)

구독 결제는 현재 버튼만 동작해요(플랜이 바로 바뀜). 실제 돈을 받으려면
**Stripe** 또는 **토스페이먼츠** 연동이 필요합니다. 이건 결제 PG 가입 후
별도로 붙이면 되고, 연동 위치는 `subscribePlan()` 함수입니다.

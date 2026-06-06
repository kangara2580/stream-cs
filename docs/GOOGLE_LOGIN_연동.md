# 구글 로그인 연동 가이드 (StreamCS)

Supabase + Google OAuth로 소셜 로그인을 연결하는 순서입니다.
코드는 이미 준비되어 있으므로, 아래 콘솔 설정만 하시면 됩니다.

---

## 준비물

- Supabase 프로젝트 (URL + anon key)
- Google 계정
- 로컬 개발: `http://localhost:3000`

---

## 1단계 — Google Cloud Console

1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 (예: `streamcs`)
3. **API 및 서비스 → OAuth 동의 화면**
   - User Type: **외부**
   - 앱 이름: `StreamCS`
   - 사용자 지원 이메일: 본인 이메일
   - 테스트 사용자에 본인 Gmail 추가 (앱이 "테스트" 상태일 때 필요)
4. **API 및 서비스 → 사용자 인증 정보 → + 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
   - 애플리케이션 유형: **웹 애플리케이션**
   - 이름: `StreamCS Web`
   - **승인된 리디렉션 URI**에 아래 주소 추가:

```
https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
```

> `YOUR-PROJECT-ID`는 Supabase Project URL의 서브도메인입니다.
> 예: `https://abcd1234.supabase.co` → `https://abcd1234.supabase.co/auth/v1/callback`

5. 생성 후 **클라이언트 ID**와 **클라이언트 보안 비밀번호**를 복사해 둡니다.

---

## 2단계 — Supabase Google Provider

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Google** 찾아서 **Enable**
3. Google Cloud에서 복사한 값 입력:
   - **Client ID**
   - **Client Secret**
4. **Save** 클릭

---

## 3단계 — Supabase URL 설정

1. **Authentication** → **URL Configuration**
2. 아래처럼 입력:

| 항목 | 로컬 개발 값 |
|------|-------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/**` |

3. Vercel 배포 시 Site URL을 실제 도메인으로 변경 (예: `https://your-app.vercel.app`)

---

## 4단계 — StreamCS Supabase 키 입력

로컬:

```bash
cp public/supabase-config.example.js public/supabase-config.js
```

`public/supabase-config.js` 수정:

```javascript
window.STREAMCS_SUPABASE = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-KEY",
};
```

Vercel 배포 시 환경 변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 5단계 — 테스트

```bash
npm run dev:fresh
```

1. 브라우저에서 `http://localhost:3000` 접속
2. **시작하기** → 로그인 화면
3. **Google로 계속하기** 클릭
4. Google 계정 선택 후 돌아오면 **대시보드**로 이동해야 합니다

---

## 자주 나는 오류

| 증상 | 해결 |
|------|------|
| `redirect_uri_mismatch` | Google Console의 Redirect URI가 Supabase callback URL과 정확히 일치하는지 확인 |
| 로그인 후 랜딩으로 돌아감 | 브라우저 새로고침. 최신 코드는 로그인 후 `#dashboard/overview`로 이동합니다 |
| 데모 모드로만 동작 | `supabase-config.js`에 실제 URL/키가 들어갔는지, `npm run dev` 재시작했는지 확인 |
| `Access blocked: app not verified` | OAuth 동의 화면이 "테스트" 상태면 테스트 사용자에 본인 Gmail을 추가 |
| `Unable to exchange external code` | **Client Secret 불일치** (가장 흔함). 아래 "교환 오류 해결" 참고 |

---

## 교환 오류 해결 (`Unable to exchange external code`)

구글 계정 선택까지 되는데 로그인이 안 되고 URL에 `error=server_error`가 뜨면,
**Supabase가 구글에서 받은 코드를 토큰으로 바꾸지 못한 것**입니다. 앱 코드 문제가 아니라 **구글 콘솔 ↔ Supabase 키 불일치**입니다.

### 1) Client Secret 새로 발급 (권장)

1. [Google Cloud Console](https://console.cloud.google.com) → **API 및 서비스 → 사용자 인증 정보**
2. 사용 중인 **OAuth 2.0 클라이언트 ID (웹)** 클릭
3. **클라이언트 보안 비밀번호** → **새 보안 비밀번호 추가** → 복사
4. Supabase → **Authentication → Providers → Google**
5. **Client Secret** 칸을 **전부 지우고** 새 Secret만 붙여넣기 (앞뒤 공백 없이)
6. **Save**

### 2) Client ID 형식 확인

Google에서 보이는 전체 ID를 넣으세요. 예:

```
748831479192-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

`.apps.googleusercontent.com`까지 포함된 **웹 애플리케이션**용 ID여야 합니다.

### 3) Redirect URI 재확인 (Google Console)

```
https://zvipxncqreyvnmjqjbqf.supabase.co/auth/v1/callback
```

`http://localhost:3000`은 **Google Console에 넣지 않습니다.**

### 4) 그래도 안 되면 OAuth 클라이언트 새로 만들기

1. Google Console에서 **새 OAuth 2.0 클라이언트 ID (웹)** 생성
2. Redirect URI에 위 Supabase callback URL 등록
3. 새 Client ID + Secret을 Supabase Google Provider에 입력 후 Save

---

## 다음 단계

구글 로그인이 되면 카카오도 같은 방식으로 추가할 수 있습니다.
(Supabase Providers → Kakao Enable + 카카오 개발자 콘솔 Redirect URI 등록)

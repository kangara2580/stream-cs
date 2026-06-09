# 카카오 로그인 연동 (KOE205 해결)

Supabase `signInWithOAuth({ provider: 'kakao' })`는 서버에서 **항상 `account_email` scope**를 요청합니다.  
비즈앱/개인 개발자 등록 없이는 카카오가 **KOE205**로 거부합니다.

이 프로젝트는 **카카오 OIDC 직접 연동**으로 `account_email` 없이 로그인합니다.

## 흐름

```
앱 → /api/auth/kakao → 카카오 (openid + nickname + profile_image)
     → /api/auth/kakao/callback → Supabase signInWithIdToken → 대시보드
```

## 1. 카카오 개발자 콘솔

앱: https://developers.kakao.com/console/app/1481229

### 필수 설정

1. **카카오 로그인** → 상태 **ON**
2. **OpenID Connect** → 상태 **ON**  
   https://developers.kakao.com/console/app/1481229/product/login/oidc
3. **동의항목** — 닉네임(필수), 프로필 사진 설정  
   https://developers.kakao.com/console/app/1481229/product/login/scope  
   (`account_email`은 **설정하지 않아도 됨**)
4. **Redirect URI** 추가 (플랫폼 키 → REST API 키 편집):

```
https://www.streaming-kit.com/api/auth/kakao/callback
https://streaming-kit.com/api/auth/kakao/callback
https://stream-kit.vercel.app/api/auth/kakao/callback
http://localhost:3000/api/auth/kakao/callback
```

5. **Client Secret** 활성화 (플랫폼 키 → REST API 키)

## 2. Supabase

https://supabase.com/dashboard/project/zvipxncqreyvnmjqjbqf/auth/providers?provider=Kakao

- Kakao **Enable ON**
- REST API 키 + Client Secret 입력
- **이메일 주소가 없는 사용자를 허용합니다** → **ON**

## 3. Vercel 환경 변수

| 변수 | 값 |
|------|-----|
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 로그인 Client Secret |

로컬: `.env.local`에 동일하게 추가 후 `npm run dev`

## 4. 배포 후 테스트

1. https://www.streaming-kit.com 접속
2. **카카오로 시작하기** 클릭
3. 동의 후 대시보드(`#dashboard/overview`)로 이동하면 성공

## 이메일이 꼭 필요할 때

카카오 **앱 설정 → 비즈니스**에서 **개인 개발자 등록** 후  
동의항목에 `account_email`을 추가할 수 있습니다.  
그 경우에도 현재 OIDC 방식은 이메일 없이 동작합니다.

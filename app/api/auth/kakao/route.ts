import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getKakaoCredentials,
  getKakaoRedirectUri,
} from "@/lib/kakao-auth";

export async function GET(request: NextRequest) {
  const { clientId, clientSecret } = getKakaoCredentials();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "KAKAO_REST_API_KEY / KAKAO_CLIENT_SECRET 환경 변수가 필요합니다." },
      { status: 500 },
    );
  }

  const redirectUri = getKakaoRedirectUri(request);
  const state = randomBytes(16).toString("hex");
  const nonce = randomBytes(16).toString("hex");
  const secure = process.env.NODE_ENV === "production";

  const cookieStore = await cookies();
  cookieStore.set("kakao_oauth_state", state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("kakao_oauth_nonce", nonce, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile_nickname profile_image",
    state,
    nonce,
  });

  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`,
  );
}

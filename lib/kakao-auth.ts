import type { NextRequest } from "next/server";

export function getKakaoRedirectUri(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/api/auth/kakao/callback`;
}

export function getAppOrigin(request: NextRequest): string {
  const redirectUri = getKakaoRedirectUri(request);
  return redirectUri.replace(/\/api\/auth\/kakao\/callback$/, "");
}

export function getKakaoCredentials() {
  const clientId = process.env.KAKAO_REST_API_KEY?.trim();
  const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
  return { clientId, clientSecret };
}

export async function exchangeKakaoCodeForIdToken(
  code: string,
  redirectUri: string,
): Promise<{ idToken: string } | { error: string }> {
  const { clientId, clientSecret } = getKakaoCredentials();
  if (!clientId || !clientSecret) {
    return { error: "kakao_not_configured" };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body,
  });

  const data = (await res.json()) as {
    id_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.id_token) {
    return {
      error: data.error_description || data.error || "token_exchange_failed",
    };
  }

  return { idToken: data.id_token };
}

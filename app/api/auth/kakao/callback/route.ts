import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeKakaoCodeForIdToken,
  getAppOrigin,
  getKakaoRedirectUri,
} from "@/lib/kakao-auth";
import { getSupabaseEnv } from "@/lib/supabase/config";

function redirectWithError(request: NextRequest, code: string) {
  const origin = getAppOrigin(request);
  return NextResponse.redirect(`${origin}/?kakao_error=${encodeURIComponent(code)}#auth`);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const message = errorDescription || error;
    return redirectWithError(request, message);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return redirectWithError(request, "missing_code");
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("kakao_oauth_state")?.value;
  cookieStore.delete("kakao_oauth_state");
  cookieStore.delete("kakao_oauth_nonce");

  if (!savedState || savedState !== state) {
    return redirectWithError(request, "invalid_state");
  }

  const redirectUri = getKakaoRedirectUri(request);
  const tokenResult = await exchangeKakaoCodeForIdToken(code, redirectUri);
  if ("error" in tokenResult) {
    return redirectWithError(request, tokenResult.error);
  }

  const { url: supabaseUrl, key: supabaseKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseKey) {
    return redirectWithError(request, "supabase_not_configured");
  }

  const origin = getAppOrigin(request);
  let response = NextResponse.redirect(`${origin}/#dashboard/overview`);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(`${origin}/#dashboard/overview`);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error: signInError } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: tokenResult.idToken,
  });

  if (signInError) {
    console.error("[kakao] signInWithIdToken failed:", signInError.message);
    return redirectWithError(request, signInError.message);
  }

  return response;
}

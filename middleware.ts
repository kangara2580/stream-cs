import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** public/index.html — Claude에서 작업한 UI 프로토타입을 루트에서 바로 서빙 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/index.html", request.url));
  }
}

export const config = {
  matcher: ["/"],
};

import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // ตรวจสอบเฉพาะหน้า root เท่านั้น
  if (req.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get("session_token")?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ถ้ามี session_token ให้ผ่าน
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

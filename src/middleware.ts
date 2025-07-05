import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ตรวจสอบ security routes ที่ต้องการ security token
  if (pathname.startsWith("/management/settings/security") && 
      !pathname.includes("/verify")) {
    
    const securityToken = request.cookies.get("security_token")?.value;
    
    if (!securityToken) {
      return NextResponse.redirect(new URL("/management/settings/security/verify", request.url));
    }
  }

  // ตรวจสอบสิทธิ์การเข้าถึงหน้า management ที่ต้องการ admin/developer
  if (pathname === "/management/user" || pathname === "/management/records") {
    const sessionToken = request.cookies.get("session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};

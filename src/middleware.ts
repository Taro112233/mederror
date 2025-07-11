import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtToken } from "@/lib/utils";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};

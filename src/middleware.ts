import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/register", "/favicon.ico"];

async function decodeJwt(token: string) {
  try {
    // ไม่ต้อง verify signature แค่ decode payload
    const { payload } = await jwtVerify(token, new TextEncoder().encode("dev_secret"), { algorithms: ["HS256"] });
    return payload;
  } catch {
    // ถ้า verify ไม่ผ่าน ให้ถือว่า token ไม่ valid
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // ข้าม static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get("session_token")?.value;
  // 1. ยังไม่ได้ login
  if (!sessionToken) {
    if (!PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // 2. login แล้ว decode JWT
  const payload = await decodeJwt(sessionToken);
  if (!payload) {
    // token ไม่ valid
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // 3. ยังไม่ onboarded
  if (!payload.onboarded) {
    if (pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.next();
  }

  // 4. onboarded แล้วแต่ยังไม่ approved
  if (!payload.approved) {
    if (pathname !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return NextResponse.next();
  }

  // 5. approved แล้ว
  // ถ้าอยู่ใน /login, /onboarding, /pending-approval ให้ redirect ไปหน้าแรก
  if (["/login", "/onboarding", "/pending-approval"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  // อื่น ๆ ให้ผ่าน
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { LoginCredentialSchema } from "@/lib/zodSchemas";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export async function POST(req: NextRequest) {
  const decision = await aj.protect(req, { requested: 5 });
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 },
      );
    } else if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "No bots allowed", reason: decision.reason },
        { status: 403 },
      );
    } else {
      return NextResponse.json(
        { error: "Forbidden", reason: decision.reason },
        { status: 403 },
      );
    }
  }
  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 },
    );
  }
  try {
    const body = await req.json();
    const parseResult = LoginCredentialSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { username, password, organizationId } = body;
    // หา account ตาม username + organizationId
    const account = await prisma.account.findFirst({
      where: { username, organizationId: organizationId || undefined },
    });
    if (!account) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
    // ตรวจสอบรหัสผ่าน
    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
    // Clear session เดิม (set session_token ให้หมดอายุทันที)
    // (Next.js API route ไม่มี access cookie เดิมโดยตรง แต่ client ควรลบ cookie ก่อน login ใหม่)
    // สร้าง JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET must be set in production environment");
      }
    }
    const secretToUse = jwtSecret || "dev_secret";
    const payload = {
      id: account.id,
      sub: account.id,
      onboarded: account.onboarded,
      organizationId: account.organizationId,
      role: account.role,
    };
    const sessionToken = jwt.sign(payload, secretToUse, { expiresIn: "2h" });
    // set cookie (httpOnly, secure, path=/, maxAge 7 วัน)
    const res = NextResponse.json({
      success: true,
      account: payload,
      sessionToken,
    });
    res.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
      sameSite: "lax",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

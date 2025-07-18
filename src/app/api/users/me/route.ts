import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { verifyJwtToken } from "@/lib/utils";
import { updateUserActivity, checkSessionActivity } from "@/lib/server-utils";

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

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let payload: unknown;
    try {
      payload = verifyJwtToken(sessionToken);
    } catch (e: unknown) {
      const error = e as Error;
      return NextResponse.json({ error: error.message || "Invalid session" }, { status: 401 });
    }
    const accountId = (payload as { id: string }).id;
    
    // ตรวจสอบการใช้งานล่าสุด
    const isSessionActive = await checkSessionActivity(accountId);
    if (!isSessionActive) {
      return NextResponse.json({ error: "Session expired due to inactivity" }, { status: 401 });
    }

    // อัปเดตการใช้งานล่าสุด
    await updateUserActivity(accountId);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { user: true, organization: true },
    });
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: account.id,
      accountId: account.id,
      username: account.username,
      role: account.role,
      name: account.user?.name || "",
      position: account.user?.position || "",
      phone: account.user?.phone || "",
      organizationId: account.organizationId || "",
      organizationName: account.organization?.name || "",
      onboarded: account.onboarded,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let payload: unknown;
    try {
      payload = verifyJwtToken(sessionToken);
    } catch (e: unknown) {
      const error = e as Error;
      return NextResponse.json({ error: error.message || "Invalid session" }, { status: 401 });
    }
    const accountId = (payload as { id: string }).id;
    if (!accountId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ไม่ตรงกัน" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }
    const isValidPassword = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 401 });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.account.update({
      where: { id: accountId },
      data: { passwordHash: newPasswordHash },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
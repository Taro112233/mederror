import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, password, organizationId } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }
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
    // สร้าง session token (แบบง่าย: ใช้ uuid หรือ accountId + timestamp + hash)
    // ใน production ควรใช้ JWT หรือ random token เก็บใน DB ด้วย
    const sessionToken = `${account.id}.${Date.now()}`;
    // set cookie (httpOnly, secure, path=/, maxAge 7 วัน)
    const res = NextResponse.json({
      success: true,
      account: {
        id: account.id,
        approved: account.approved,
        onboarded: account.onboarded,
        organizationId: account.organizationId,
      },
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

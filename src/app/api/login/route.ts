import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client/edge";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    // Clear session เดิม (set session_token ให้หมดอายุทันที)
    // (Next.js API route ไม่มี access cookie เดิมโดยตรง แต่ client ควรลบ cookie ก่อน login ใหม่)
    // สร้าง JWT token
    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    const payload = {
      id: account.id,
      sub: account.id,
      onboarded: account.onboarded,
      organizationId: account.organizationId,
      role: account.role,
    };
    const sessionToken = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
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

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // ดึง session_token จาก cookie
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const accountId = payload.id;
    if (!accountId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    // รับข้อมูลฟอร์ม
    const { name, position, phone } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }
    // อัปเดต User
    await prisma.user.update({
      where: { accountId },
      data: { name, position, phone },
    });
    // set onboarded = true
    await prisma.account.update({ where: { id: accountId }, data: { onboarded: true } });
    // ดึง account ล่าสุด
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    // สร้าง JWT ใหม่
    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    const newPayload = {
      id: account.id,
      sub: account.id,
      onboarded: account.onboarded,
      organizationId: account.organizationId,
      role: account.role,
    };
    const newSessionToken = jwt.sign(newPayload, jwtSecret, { expiresIn: "7d" });
    // set cookie ใหม่
    const res = NextResponse.json({ success: true });
    res.cookies.set("session_token", newSessionToken, {
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
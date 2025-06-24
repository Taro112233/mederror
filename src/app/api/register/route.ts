import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/utils";
import { PrismaClient } from "@/generated/prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { sangkad, username, password } = await req.json();
  if (!sangkad || !username || !password) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }
  // เช็ค username ซ้ำ
  const exist = await prisma.user.findUnique({ where: { username } });
  if (exist) {
    return NextResponse.json({ error: "Username นี้ถูกใช้แล้ว" }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, sangkad },
  });

  // สร้าง JWT token และ set cookie เหมือน login
  const JWT_SECRET = process.env.JWT_SECRET!;
  const token = jwt.sign(
    { userId: user.id, onboarded: user.onboarded, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  const res = NextResponse.json({ success: true });
  res.cookies.set("session_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
} 
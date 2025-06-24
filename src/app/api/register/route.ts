import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/utils";
import { PrismaClient } from "@/generated/prisma/client";

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
  await prisma.user.create({
    data: { username, passwordHash, sangkad },
  });
  return NextResponse.json({ success: true });
} 
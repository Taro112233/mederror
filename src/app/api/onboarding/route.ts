import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // ดึง session_token จาก cookie
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // แยก accountId จาก session_token (รูปแบบ: accountId.timestamp)
    const accountId = sessionToken.split(".")[0];
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
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { accountId, name, position, phone } = await req.json();
    if (!accountId || !name) {
      return NextResponse.json({ error: "Missing accountId or name" }, { status: 400 });
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
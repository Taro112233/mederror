import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // ลบ refresh token ที่หมดอายุ
    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // ลบ refresh token ที่ไม่มีการใช้งานเกิน 2 ชั่วโมง
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const deletedInactiveTokens = await prisma.refreshToken.deleteMany({
      where: {
        account: {
          lastActivityAt: {
            lt: twoHoursAgo,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedExpiredTokens: deletedTokens.count,
      deletedInactiveTokens: deletedInactiveTokens.count,
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
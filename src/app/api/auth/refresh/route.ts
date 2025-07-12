import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";

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
      refillRate: 10,
      interval: 60,
      capacity: 20,
    }),
  ],
});

export async function POST(req: NextRequest) {
  const decision = await aj.protect(req, { requested: 1 });
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
    const refreshToken = req.cookies.get("refresh_token")?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 401 });
    }

    // หา refresh token ใน database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { account: true },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // ตรวจสอบว่า token หมดอายุหรือยัง
    if (tokenRecord.expiresAt < new Date()) {
      // ลบ token ที่หมดอายุ
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
    }

    // ตรวจสอบการใช้งานล่าสุด (2 ชั่วโมง)
    const lastActivity = tokenRecord.account.lastActivityAt;
    const now = new Date();
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastActivity > 2) {
      // ลบ refresh token เก่า
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      return NextResponse.json({ error: "Session expired due to inactivity" }, { status: 401 });
    }

    // อัปเดต lastActivityAt
    await prisma.account.update({
      where: { id: tokenRecord.accountId },
      data: { lastActivityAt: now },
    });

    // สร้าง access token ใหม่
    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    const payload = {
      id: tokenRecord.account.id,
      sub: tokenRecord.account.id,
      onboarded: tokenRecord.account.onboarded,
      organizationId: tokenRecord.account.organizationId,
      role: tokenRecord.account.role,
    };

    const newAccessToken = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

    // สร้าง refresh token ใหม่ (rotate)
    const newRefreshToken = randomBytes(32).toString('hex');
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 14); // 14 วัน

    // ลบ refresh token เก่าและสร้างใหม่
    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        accountId: tokenRecord.accountId,
        expiresAt: refreshExpiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });

    // ตั้งค่า cookies
    response.cookies.set("session_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1, // 1 ชั่วโมง
      sameSite: "lax",
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 วัน
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
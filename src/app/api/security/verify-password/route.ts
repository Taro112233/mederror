import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const account = await prisma.account.findUnique({
      where: { id: payload.id },
      select: { passwordHash: true }
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, account.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // สร้าง session สำหรับ security verification
    const securityToken = jwt.sign(
      { 
        id: payload.id, 
        securityVerified: true,
        verifiedAt: new Date().toISOString()
      },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "15m" } // หมดอายุใน 15 นาที
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("security_token", securityToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 // 15 minutes
    });

    return response;

  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
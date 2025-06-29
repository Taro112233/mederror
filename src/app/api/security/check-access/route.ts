import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const securityToken = cookieStore.get("security_token")?.value;
    
    if (!securityToken) {
      return NextResponse.json({ error: "Security verification required" }, { status: 401 });
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(securityToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid security token" }, { status: 401 });
    }

    // ตรวจสอบว่า token มี securityVerified และยังไม่หมดอายุ
    if (!payload.securityVerified) {
      return NextResponse.json({ error: "Security verification required" }, { status: 401 });
    }

    // ตรวจสอบว่า token ยังไม่หมดอายุ (15 นาที)
    const verifiedAt = new Date(payload.verifiedAt);
    const now = new Date();
    const timeDiff = now.getTime() - verifiedAt.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff > 15) {
      return NextResponse.json({ error: "Security verification expired" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      verifiedAt: payload.verifiedAt,
      remainingTime: Math.max(0, 15 - minutesDiff)
    });

  } catch (error) {
    console.error("Security check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET: ดึง users ที่ onboarded แล้วและอยู่ใน organization เดียวกับผู้ใช้ปัจจุบัน
export async function GET(req: NextRequest) {
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
    const organizationId = payload.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }
    // ดึง users ที่ onboarded แล้วและอยู่ใน org เดียวกัน
    const accounts = await prisma.account.findMany({
      where: {
        onboarded: true,
        organizationId,
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: "asc" },
    });
    // map ข้อมูลให้เหมาะกับ frontend
    const users = accounts.map(acc => ({
      id: acc.id,
      username: acc.username,
      role: acc.role,
      name: acc.user?.name || "",
      position: acc.user?.position || "",
      phone: acc.user?.phone || "",
    }));
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
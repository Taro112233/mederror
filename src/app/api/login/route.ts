import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import jwt from "jsonwebtoken";
import { verifyPassword } from "@/lib/utils";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const { sangkad, username, password } = await req.json();

  const user = await prisma.user.findFirst({
    where: { username, sangkad },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // สร้าง JWT
  const token = jwt.sign(
    { userId: user.id, onboarded: user.onboarded, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // ส่ง token เป็น httpOnly cookie
  const res = NextResponse.json({ success: true });
  res.cookies.set("session_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
}

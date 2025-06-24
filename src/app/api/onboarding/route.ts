/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = jwt.verify(token, JWT_SECRET) as any;
  await prisma.user.update({
    where: { id: payload.userId },
    data: { onboarded: true },
  });

  // อัปเดต token
  const newToken = jwt.sign(
    { ...payload, onboarded: true },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  const res = NextResponse.json({ success: true });
  res.cookies.set("session_token", newToken, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
}

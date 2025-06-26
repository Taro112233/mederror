import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
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
    const account = await prisma.account.findUnique({
      where: { id: payload.id },
      include: { user: true },
    });
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: account.id,
      username: account.username,
      role: account.role,
      name: account.user?.name || "",
      position: account.user?.position || "",
      phone: account.user?.phone || "",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
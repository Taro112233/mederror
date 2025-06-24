import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function POST(req: NextRequest) {
  try {
    const { username, password, organization } = await req.json();
    if (!username || !password || !organization) {
      return NextResponse.json({ error: "Missing username, password, or organization" }, { status: 400 });
    }
    const account = await prisma.account.findFirst({
      where: { username, organizationId: organization },
      include: { user: true, organization: true },
    });
    if (!account) {
      return NextResponse.json({ error: "Invalid username, password, or organization" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username, password, or organization" }, { status: 401 });
    }
    // สร้าง JWT (mock/simple)
    const token = jwt.sign({ accountId: account.id, userId: account.user?.id, organizationId: account.organizationId }, JWT_SECRET, { expiresIn: "7d" });
    return NextResponse.json({ success: true, token, organization: account.organization });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
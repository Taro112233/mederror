import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, password, organizationId } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }
    // Check if username exists
    const existing = await prisma.account.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // Create Account and User
    const account = await prisma.account.create({
      data: {
        username,
        passwordHash,
        organizationId: organizationId || null,
        onboarded: false,
        approved: false,
        user: { create: {} },
      },
      include: { user: true },
    });
    return NextResponse.json({ success: true, accountId: account.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
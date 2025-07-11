import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { RegisterCredentialSchema } from "@/lib/zodSchemas";

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
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export async function POST(req: NextRequest) {
  const decision = await aj.protect(req, { requested: 5 });
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
    const body = await req.json();
    const parseResult = RegisterCredentialSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { username, password, organizationId } = body;
    // Check if username exists
    const existing = await prisma.account.findFirst({ where: { username, organizationId: organizationId || undefined } });
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
        role: "UNAPPROVED",
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
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/utils";

// GET: ดึงรายชื่อองค์กรทั้งหมด
export async function GET() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orgs);
}

// POST: สร้างองค์กรใหม่
export async function POST(req: NextRequest) {
  // JWT verification
  const sessionToken = req.cookies.get("session_token")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    verifyJwtToken(sessionToken);
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message || "Invalid session" }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "ชื่อองค์กรไม่ถูกต้อง" }, { status: 400 });
  }
  const org = await prisma.organization.create({
    data: { name },
  });
  return NextResponse.json(org, { status: 201 });
} 
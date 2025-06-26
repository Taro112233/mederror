import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ดึงรายชื่อองค์กรทั้งหมด
export async function GET() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orgs);
}

// POST: สร้างองค์กรใหม่
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "ชื่อองค์กรไม่ถูกต้อง" }, { status: 400 });
  }
  const org = await prisma.organization.create({
    data: { name },
  });
  return NextResponse.json(org, { status: 201 });
} 
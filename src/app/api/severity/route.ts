import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const severities = await prisma.severity.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(severities);
} 
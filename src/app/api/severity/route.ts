import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const severities = await prisma.severity.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(severities);
} 
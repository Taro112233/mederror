import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client/edge";

const prisma = new PrismaClient();

export async function GET() {
  const units = await prisma.unit.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(units);
} 
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const errorTypes = await prisma.errorType.findMany({
    orderBy: { code: "asc" },
    include: { subErrorTypes: { orderBy: { code: "asc" } } },
  });
  return NextResponse.json(errorTypes);
} 
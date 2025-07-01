import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const errorTypeId = searchParams.get("errorTypeId");
  const where = errorTypeId ? { errorTypeId } : undefined;
  const subErrorTypes = await prisma.subErrorType.findMany({
    where,
    orderBy: { code: "asc" },
  });
  return NextResponse.json(subErrorTypes);
} 
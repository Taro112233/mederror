import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const errorTypes = await prisma.errorType.findMany({
    orderBy: { code: "asc" },
    include: { subErrorTypes: { orderBy: { code: "asc" } } },
  });
  return NextResponse.json(errorTypes);
} 
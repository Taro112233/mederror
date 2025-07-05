import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET: ดึงข้อมูลจากตารางที่ระบุ
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    // ตรวจสอบสิทธิ์ Developer
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // @ts-ignore
    const account = await prisma.account.findUnique({ where: { id: payload.id } });
    if (!account || account.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { table } = await params;
    
    // ตรวจสอบว่าตารางที่ระบุมีอยู่จริง
    const validTables = ['account', 'organization', 'user', 'medError', 'severity', 'errorType', 'subErrorType', 'unit'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // ดึงข้อมูลจากตารางที่ระบุ
    let data;
    switch (table) {
      case 'account':
        // @ts-ignore
        data = await prisma.account.findMany({
          include: { organization: true, user: true },
          orderBy: { createdAt: "desc" }
        });
        break;
      case 'organization':
        // @ts-ignore
        data = await prisma.organization.findMany({
          include: { accounts: true },
          orderBy: { createdAt: "desc" }
        });
        break;
      case 'user':
        // @ts-ignore
        data = await prisma.user.findMany({
          include: { account: true },
          orderBy: { id: "desc" }
        });
        break;
      case 'medError':
        // @ts-ignore
        data = await prisma.medError.findMany({
          include: {
            errorType: true,
            severity: true,
            subErrorType: true,
            unit: true,
            reporterAccount: true,
          },
          orderBy: { eventDate: "desc" }
        });
        break;
      case 'severity':
        // @ts-ignore
        data = await prisma.severity.findMany({
          orderBy: { code: "asc" }
        });
        break;
      case 'errorType':
        // @ts-ignore
        data = await prisma.errorType.findMany({
          include: { subErrorTypes: true },
          orderBy: { code: "asc" }
        });
        break;
      case 'subErrorType':
        // @ts-ignore
        data = await prisma.subErrorType.findMany({
          include: { errorType: true },
          orderBy: { code: "asc" }
        });
        break;
      case 'unit':
        // @ts-ignore
        data = await prisma.unit.findMany({
          orderBy: { code: "asc" }
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Database API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: เพิ่มข้อมูลใหม่ในตารางที่ระบุ
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    // ตรวจสอบสิทธิ์ Developer
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // @ts-ignore
    const account = await prisma.account.findUnique({ where: { id: payload.id } });
    if (!account || account.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { table } = await params;
    const body = await req.json();

    // ตรวจสอบว่าตารางที่ระบุมีอยู่จริง
    const validTables = ['account', 'organization', 'user', 'medError', 'severity', 'errorType', 'subErrorType', 'unit'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // เพิ่มข้อมูลในตารางที่ระบุ
    let result;
    switch (table) {
      case 'account':
        // @ts-ignore
        result = await prisma.account.create({ data: body });
        break;
      case 'organization':
        // @ts-ignore
        result = await prisma.organization.create({ data: body });
        break;
      case 'user':
        // @ts-ignore
        result = await prisma.user.create({ data: body });
        break;
      case 'medError':
        // @ts-ignore
        result = await prisma.medError.create({ data: body });
        break;
      case 'severity':
        // @ts-ignore
        result = await prisma.severity.create({ data: body });
        break;
      case 'errorType':
        // @ts-ignore
        result = await prisma.errorType.create({ data: body });
        break;
      case 'subErrorType':
        // @ts-ignore
        result = await prisma.subErrorType.create({ data: body });
        break;
      case 'unit':
        // @ts-ignore
        result = await prisma.unit.create({ data: body });
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Database API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
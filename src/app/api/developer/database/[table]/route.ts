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
          orderBy: { createdAt: "desc" }
        });
        break;
      case 'user':
        // @ts-ignore
        data = await prisma.user.findMany({
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

    // กรองข้อมูลที่ส่งไปให้ Prisma (ไม่รวมข้อมูลที่เกี่ยวข้อง)
    const filterData = (data: any, tableName: string) => {
      const filtered = { ...data };
      
      // ลบ fields ที่ไม่ควรสร้าง
      delete filtered.id;
      delete filtered.createdAt;
      delete filtered.updatedAt;
      
      // ลบข้อมูลที่เกี่ยวข้องตามตาราง
      switch (tableName) {
        case 'account':
          delete filtered.organization;
          delete filtered.user;
          delete filtered.medErrors;
          break;
        case 'organization':
          delete filtered.accounts;
          break;
        case 'user':
          delete filtered.account;
          break;
        case 'medError':
          delete filtered.errorType;
          delete filtered.severity;
          delete filtered.subErrorType;
          delete filtered.unit;
          delete filtered.reporterAccount;
          delete filtered.images;
          break;
        case 'errorType':
          delete filtered.subErrorTypes;
          break;
        case 'subErrorType':
          delete filtered.errorType;
          break;
      }
      
      return filtered;
    };

    // เพิ่มข้อมูลในตารางที่ระบุ
    let result;
    switch (table) {
      case 'account':
        // @ts-ignore
        result = await prisma.account.create({ data: filterData(body, 'account') });
        break;
      case 'organization':
        // @ts-ignore
        result = await prisma.organization.create({ data: filterData(body, 'organization') });
        break;
      case 'user':
        // @ts-ignore
        result = await prisma.user.create({ data: filterData(body, 'user') });
        break;
      case 'medError':
        // @ts-ignore
        result = await prisma.medError.create({ data: filterData(body, 'medError') });
        break;
      case 'severity':
        // @ts-ignore
        result = await prisma.severity.create({ data: filterData(body, 'severity') });
        break;
      case 'errorType':
        // @ts-ignore
        result = await prisma.errorType.create({ data: filterData(body, 'errorType') });
        break;
      case 'subErrorType':
        // @ts-ignore
        result = await prisma.subErrorType.create({ data: filterData(body, 'subErrorType') });
        break;
      case 'unit':
        // @ts-ignore
        result = await prisma.unit.create({ data: filterData(body, 'unit') });
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
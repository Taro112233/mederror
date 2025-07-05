import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// PUT: แก้ไขข้อมูลในตารางที่ระบุ
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
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

    const account = await prisma.account.findUnique({ where: { id: payload.id } });
    if (!account || account.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { table, id } = await params;
    const body = await req.json();

    // ตรวจสอบว่าตารางที่ระบุมีอยู่จริง
    const validTables = ['account', 'organization', 'user', 'medError', 'severity', 'errorType', 'subErrorType', 'unit'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // กรองข้อมูลที่ส่งไปให้ Prisma (ไม่รวมข้อมูลที่เกี่ยวข้อง)
    const filterData = (data: Record<string, unknown>, tableName: string) => {
      const filtered = { ...data };
      
      // ลบ fields ที่ไม่ควรอัปเดต
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

    // แก้ไขข้อมูลในตารางที่ระบุ
    let result;
    switch (table) {
      case 'account':
        result = await prisma.account.update({ 
          where: { id }, 
          data: filterData(body, 'account') 
        });
        break;
      case 'organization':
        result = await prisma.organization.update({ 
          where: { id }, 
          data: filterData(body, 'organization') 
        });
        break;
      case 'user':
        result = await prisma.user.update({ 
          where: { id }, 
          data: filterData(body, 'user') 
        });
        break;
      case 'medError':
        result = await prisma.medError.update({ 
          where: { id }, 
          data: filterData(body, 'medError') 
        });
        break;
      case 'severity':
        result = await prisma.severity.update({ 
          where: { id }, 
          data: filterData(body, 'severity') 
        });
        break;
      case 'errorType':
        result = await prisma.errorType.update({ 
          where: { id }, 
          data: filterData(body, 'errorType') 
        });
        break;
      case 'subErrorType':
        result = await prisma.subErrorType.update({ 
          where: { id }, 
          data: filterData(body, 'subErrorType') 
        });
        break;
      case 'unit':
        result = await prisma.unit.update({ 
          where: { id }, 
          data: filterData(body, 'unit') 
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: ลบข้อมูลจากตารางที่ระบุ
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
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

    const account = await prisma.account.findUnique({ where: { id: payload.id } });
    if (!account || account.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { table, id } = await params;

    // ตรวจสอบว่าตารางที่ระบุมีอยู่จริง
    const validTables = ['account', 'organization', 'user', 'medError', 'severity', 'errorType', 'subErrorType', 'unit'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // ลบข้อมูลจากตารางที่ระบุ
    switch (table) {
      case 'account':
        await prisma.account.delete({ where: { id } });
        break;
      case 'organization':
        await prisma.organization.delete({ where: { id } });
        break;
      case 'user':
        await prisma.user.delete({ where: { id } });
        break;
      case 'medError':
        await prisma.medError.delete({ where: { id } });
        break;
      case 'severity':
        await prisma.severity.delete({ where: { id } });
        break;
      case 'errorType':
        await prisma.errorType.delete({ where: { id } });
        break;
      case 'subErrorType':
        await prisma.subErrorType.delete({ where: { id } });
        break;
      case 'unit':
        await prisma.unit.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
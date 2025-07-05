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

    // @ts-ignore
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

    // แก้ไขข้อมูลในตารางที่ระบุ
    let result;
    switch (table) {
      case 'account':
        // @ts-ignore
        result = await prisma.account.update({ where: { id }, data: body });
        break;
      case 'organization':
        // @ts-ignore
        result = await prisma.organization.update({ where: { id }, data: body });
        break;
      case 'user':
        // @ts-ignore
        result = await prisma.user.update({ where: { id }, data: body });
        break;
      case 'medError':
        // @ts-ignore
        result = await prisma.medError.update({ where: { id }, data: body });
        break;
      case 'severity':
        // @ts-ignore
        result = await prisma.severity.update({ where: { id }, data: body });
        break;
      case 'errorType':
        // @ts-ignore
        result = await prisma.errorType.update({ where: { id }, data: body });
        break;
      case 'subErrorType':
        // @ts-ignore
        result = await prisma.subErrorType.update({ where: { id }, data: body });
        break;
      case 'unit':
        // @ts-ignore
        result = await prisma.unit.update({ where: { id }, data: body });
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

    // @ts-ignore
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
        // @ts-ignore
        await prisma.account.delete({ where: { id } });
        break;
      case 'organization':
        // @ts-ignore
        await prisma.organization.delete({ where: { id } });
        break;
      case 'user':
        // @ts-ignore
        await prisma.user.delete({ where: { id } });
        break;
      case 'medError':
        // @ts-ignore
        await prisma.medError.delete({ where: { id } });
        break;
      case 'severity':
        // @ts-ignore
        await prisma.severity.delete({ where: { id } });
        break;
      case 'errorType':
        // @ts-ignore
        await prisma.errorType.delete({ where: { id } });
        break;
      case 'subErrorType':
        // @ts-ignore
        await prisma.subErrorType.delete({ where: { id } });
        break;
      case 'unit':
        // @ts-ignore
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
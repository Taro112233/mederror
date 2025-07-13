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

    const account = await prisma.account.findUnique({ where: { id: payload.id } });
    if (!account || account.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { table } = await params;
    
    // ตรวจสอบว่าตารางที่ระบุมีอยู่จริง
    const validTables = ['account', 'organization', 'user', 'medError', 'severity', 'errorType', 'subErrorType', 'unit', 'feedback'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // ดึงข้อมูลจากตารางที่ระบุ
    let data;
    switch (table) {
      case 'account':
        data = await prisma.account.findMany({
          include: { organization: true, user: true },
          orderBy: { createdAt: "desc" }
        });
        break;
      case 'organization':
        data = await prisma.organization.findMany({
          orderBy: { createdAt: "desc" }
        });
        break;
      case 'user':
        data = await prisma.user.findMany({
          orderBy: { id: "desc" }
        });
        break;
      case 'medError':
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
      case 'feedback':
        data = await prisma.feedback.findMany({
          include: {
            user: true,
            organization: true,
          },
          orderBy: { createdAt: "desc" }
        });
        break;
      case 'severity':
        data = await prisma.severity.findMany({
          orderBy: { code: "asc" }
        });
        break;
      case 'errorType':
        data = await prisma.errorType.findMany({
          include: { subErrorTypes: true },
          orderBy: { code: "asc" }
        });
        break;
      case 'subErrorType':
        data = await prisma.subErrorType.findMany({
          include: { errorType: true },
          orderBy: { code: "asc" }
        });
        break;
      case 'unit':
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

    const account = await prisma.account.findUnique({ where: { id: payload.id } });
    if (!account || account.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { table } = await params;
    const body = await req.json();

    // ตรวจสอบว่าตารางที่ระบุมีอยู่จริง
    const validTables = ['account', 'organization', 'user', 'medError', 'severity', 'errorType', 'subErrorType', 'unit', 'feedback'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // ตรวจสอบ field ที่จำเป็นสำหรับแต่ละ table (อิงจาก schema.prisma)
    const requiredFields: Record<string, string[]> = {
      account: ["username", "passwordHash", "role"],
      organization: ["name"],
      user: ["accountId"],
      medError: ["eventDate", "unitId", "description", "severityId", "errorTypeId", "subErrorTypeId", "reporterAccountId", "reporterUsername", "reporterName", "reporterPosition", "reporterPhone"],
      severity: ["code", "label"],
      errorType: ["code", "label"],
      subErrorType: ["code", "label", "errorTypeId"],
      unit: ["code", "label"],
      feedback: ["message", "userId", "organizationId"],
    };
    const missingFields = (requiredFields[table] || []).filter((field) => !(field in body) || body[field] === undefined || body[field] === null || body[field] === "");
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(", ")}` }, { status: 400 });
    }

    // เพิ่มข้อมูลในตารางที่ระบุ
    let result;
    function buildData(table: string, body: Record<string, unknown>) {
      const data: Record<string, unknown> = {};
      if (table === 'medError') {
        data.eventDate = body.eventDate;
        data.unit = { connect: { id: body.unitId } };
        data.description = body.description;
        data.severity = { connect: { id: body.severityId } };
        data.errorType = { connect: { id: body.errorTypeId } };
        data.subErrorType = { connect: { id: body.subErrorTypeId } };
        data.reporterAccount = { connect: { id: body.reporterAccountId } };
        data.reporterUsername = body.reporterUsername;
        data.reporterName = body.reporterName;
        data.reporterPosition = body.reporterPosition;
        data.reporterPhone = body.reporterPhone;
        if (body.reporterOrganizationId) data.reporterOrganizationId = body.reporterOrganizationId;
      } else if (table === 'user') {
        data.account = { connect: { id: body.accountId } };
        if (body.name) data.name = body.name;
        if (body.position) data.position = body.position;
        if (body.phone) data.phone = body.phone;
      } else if (table === 'subErrorType') {
        data.code = body.code;
        data.label = body.label;
        data.errorType = { connect: { id: body.errorTypeId } };
      } else if (table === 'feedback') {
        data.message = body.message;
        data.user = { connect: { id: body.userId } };
        data.organization = { connect: { id: body.organizationId } };
      } else {
        for (const field of requiredFields[table] || []) {
          data[field] = body[field];
        }
      }
      return data;
    }
    switch (table) {
      case 'account':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.account.create({ data: buildData('account', body) as any });
        break;
      case 'organization':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.organization.create({ data: buildData('organization', body) as any });
        break;
      case 'user':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.user.create({ data: buildData('user', body) as any });
        break;
      case 'medError':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.medError.create({ data: buildData('medError', body) as any });
        break;
      case 'feedback':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.feedback.create({ data: buildData('feedback', body) as any });
        break;
      case 'severity':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.severity.create({ data: buildData('severity', body) as any });
        break;
      case 'errorType':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.errorType.create({ data: buildData('errorType', body) as any });
        break;
      case 'subErrorType':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.subErrorType.create({ data: buildData('subErrorType', body) as any });
        break;
      case 'unit':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await prisma.unit.create({ data: buildData('unit', body) as any });
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
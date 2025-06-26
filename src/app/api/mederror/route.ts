import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // รับ multipart form-data
    const formData = await req.formData();
    // รับข้อมูลฟอร์ม
    const eventDate = formData.get("eventDate");
    const description = formData.get("description");
    const severityId = formData.get("severity");
    const errorTypeId = formData.get("errorType");
    const subErrorTypeId = formData.get("subErrorType");
    // ข้อมูลผู้รายงาน (Account)
    const reporterAccountId = formData.get("reporterAccountId");
    const reporterUsername = formData.get("reporterUsername");
    const reporterName = formData.get("reporterName");
    const reporterPosition = formData.get("reporterPosition");
    const reporterPhone = formData.get("reporterPhone");
    const reporterOrganizationId = formData.get("reporterOrganizationId");

    // ตรวจสอบว่า account ไม่ใช่ UNAPPROVED
    const account = await prisma.account.findUnique({ where: { id: reporterAccountId as string } });
    if (!account || account.role === "UNAPPROVED") {
      return NextResponse.json({ error: "บัญชีนี้ยังไม่ได้รับอนุมัติ ไม่สามารถส่งรายงานได้" }, { status: 403 });
    }

    // รับไฟล์รูป (รองรับหลายไฟล์)
    const images = formData.getAll("image").filter(Boolean);
    // สร้าง MedError
    const medError = await prisma.medError.create({
      data: {
        eventDate: new Date(eventDate as string),
        description: description as string,
        severityId: severityId as string,
        errorTypeId: errorTypeId as string,
        subErrorTypeId: subErrorTypeId as string,
        reporterAccountId: reporterAccountId as string,
        reporterUsername: reporterUsername as string,
        reporterName: reporterName as string,
        reporterPosition: reporterPosition as string,
        reporterPhone: reporterPhone as string,
        reporterOrganizationId: reporterOrganizationId as string | null,
      },
    });

    // บันทึกไฟล์รูปภาพ (สมมติบันทึกใน public/uploads)
    const imageRecords = [];
    for (const file of images) {
      if (typeof file === "string") continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      const url = `/uploads/${filename}`;
      const img = await prisma.medErrorImage.create({
        data: {
          medErrorId: medError.id,
          url,
        },
      });
      imageRecords.push(img);
    }

    return NextResponse.json({ success: true, medError, images: imageRecords }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
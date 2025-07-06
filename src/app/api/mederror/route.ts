import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadMultipleToBlob } from "@/lib/blob";

export async function POST(req: NextRequest) {
  try {
    // รับ multipart form-data
    const formData = await req.formData();
    // รับข้อมูลฟอร์ม
    const eventDate = formData.get("eventDate");
    const unitId = formData.get("unitId");
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
        unitId: unitId as string,
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

    // บันทึกไฟล์รูปภาพไปยัง Vercel Blob
    const imageRecords = [];
    if (images.length > 0) {
      try {
        // Filter out string values and only keep File objects
        const fileImages = images.filter((img): img is File => img instanceof File);
        
        if (fileImages.length > 0) {
          const uploadedBlobs = await uploadMultipleToBlob(fileImages);
          
          for (const blob of uploadedBlobs) {
            const img = await prisma.medErrorImage.create({
              data: {
                medErrorId: medError.id,
                url: blob.url,
              },
            });
            imageRecords.push(img);
          }
        }
      } catch (error) {
        console.error('Error uploading images to blob:', error);
        // Continue with the medError creation even if image upload fails
      }
    }

    return NextResponse.json({ success: true, medError, images: imageRecords }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // รับ organizationId และ reporterAccountId จาก query parameter
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const reporterAccountId = searchParams.get("reporterAccountId");

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // สร้าง where condition
    const whereCondition: Record<string, unknown> = {
      reporterOrganizationId: organizationId,
    };

    // ถ้ามี reporterAccountId ให้กรองตาม reporterAccountId ด้วย
    if (reporterAccountId) {
      whereCondition.reporterAccountId = reporterAccountId;
    }

    // ดึงข้อมูล MedError ที่อยู่ใน organization เดียวกัน
    const medErrors = await prisma.medError.findMany({
      where: whereCondition,
      include: {
        unit: true,
        severity: true,
        errorType: true,
        subErrorType: true,
        images: true,
        reporterAccount: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(medErrors);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "MedError id is required" }, { status: 400 });
    }

    // Delete MedErrorImage records first
    await prisma.medErrorImage.deleteMany({ where: { medErrorId: id } });
    // Then delete MedError record
    await prisma.medError.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
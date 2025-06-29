import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// PATCH: อัปเดตข้อมูลโปรไฟล์หรือเปลี่ยน role
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    
    const body = await req.json();
    const { params } = await context;
    
    // ถ้ามี role ใน body = อัปเดต role (สำหรับ admin)
    if (body.role) {
      const updated = await prisma.account.update({
        where: { id: params.id },
        data: { role: body.role },
      });
      return NextResponse.json({ success: true, role: updated.role });
    }
    
    // ถ้าไม่มี role = อัปเดตข้อมูลโปรไฟล์ (สำหรับ user เอง)
    const { username, name, position, phone } = body;
    
    // ตรวจสอบว่ามี username หรือไม่
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }
    
    // ใช้ transaction เพื่ออัปเดตทั้ง account และ user
    const result = await prisma.$transaction(async (tx) => {
      // อัปเดต account (username และ role เป็น UNAPPROVED)
      const updatedAccount = await tx.account.update({
        where: { id: params.id },
        data: { 
          username,
          role: "UNAPPROVED" // เปลี่ยน role เป็น UNAPPROVED
        },
      });
      
      // อัปเดต user (name, position, phone)
      const updatedUser = await tx.user.update({
        where: { accountId: params.id },
        data: { 
          name: name || null,
          position: position || null,
          phone: phone || null,
        },
      });
      
      return { account: updatedAccount, user: updatedUser };
    });
    
    return NextResponse.json({ 
      success: true, 
      account: result.account,
      user: result.user
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: ลบ account และ user
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const { params } = await context;
    
    // ใช้ transaction เพื่อให้แน่ใจว่าการลบทั้งสองตารางจะสำเร็จหรือล้มเหลวพร้อมกัน
    await prisma.$transaction(async (tx) => {
      // ลบ user ก่อน (ถ้ามี) - ใช้ delete() แทน deleteMany() เพราะเป็น one-to-one relationship
      try {
        await tx.user.delete({ where: { accountId: params.id } });
      } catch {
        // ถ้าไม่มี user ให้ข้ามไป (ไม่ใช่ error)
        console.log(`No user found for account ${params.id}`);
      }
      
      // ลบ account
      await tx.account.delete({ where: { id: params.id } });
    });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting user/account:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// PATCH: เปลี่ยน role
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const { role } = await req.json();
    if (!role) return NextResponse.json({ error: "Missing role" }, { status: 400 });
    const { params } = await context;
    const updated = await prisma.account.update({
      where: { id: params.id },
      data: { role },
    });
    return NextResponse.json({ success: true, role: updated.role });
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
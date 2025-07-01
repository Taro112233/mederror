import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// PATCH: อัปเดตข้อมูลโปรไฟล์หรือเปลี่ยน role
export async function PATCH(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }
    // ถ้ามี role ใน body = อัปเดต role (สำหรับ admin)
    if (body.role) {
      const updated = await prisma.account.update({
        where: { id },
        data: { role: body.role },
      });
      return NextResponse.json({ success: true, role: updated.role });
    }
    // ถ้าไม่มี role = อัปเดตข้อมูลโปรไฟล์ (สำหรับ user เอง)
    const { username, name, position, phone } = body;
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }
    // อัปเดต account (username และ role เป็น UNAPPROVED)
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        username,
        role: "UNAPPROVED"
      },
    });
    // อัปเดต user (name, position, phone)
    const updatedUser = await prisma.user.update({
      where: { accountId: id },
      data: {
        name: name || null,
        position: position || null,
        phone: phone || null,
      },
    });
    return NextResponse.json({
      success: true,
      account: updatedAccount,
      user: updatedUser
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: ลบ account และ user
export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }
    // ลบ account อย่างเดียว
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting user/account:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
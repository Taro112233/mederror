import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CardButton from "@/components/CardButton";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function AdminSettings() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) {
    redirect("/login");
  }
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
  } catch {
    redirect("/login");
  }
  const prisma = new PrismaClient();
  const account = await prisma.account.findUnique({ where: { id: payload.id } });
  if (!account) {
    redirect("/login");
  }
  if (!account.onboarded) {
    redirect("/onboarding");
  }
  if (!account.role || account.role === "UNAPPROVED") {
    redirect("/pending-approval");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ตั้งค่าผู้ใช้งาน</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CardButton href="/management/settings/profile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              โปรไฟล์ผู้ใช้
            </CardTitle>
            <CardDescription>
              จัดการข้อมูลส่วนตัวและโปรไฟล์
            </CardDescription>
          </CardHeader>
        </CardButton>

        <CardButton href="/management/settings/security/verify">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              ความปลอดภัย
            </CardTitle>
            <CardDescription>
              ตั้งค่ารหัสผ่านและการรักษาความปลอดภัย
            </CardDescription>
          </CardHeader>
        </CardButton>

        <CardButton href="/management/settings/notifications">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              การแจ้งเตือน
            </CardTitle>
            <CardDescription>
              จัดการการแจ้งเตือนและอีเมล
            </CardDescription>
          </CardHeader>
        </CardButton>
      </div>

      <div className="flex justify-start">
        <Button asChild variant="secondary">
          <Link href="/management">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Link>
        </Button>
      </div>
    </div>
  );
} 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Key, Lock, Eye } from "lucide-react";
import Link from "next/link";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function SecuritySettings() {
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
        <h2 className="text-3xl font-bold tracking-tight">ความปลอดภัย</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              เปลี่ยนรหัสผ่าน
            </CardTitle>
            <CardDescription>
              อัปเดตรหัสผ่านของคุณเพื่อความปลอดภัย
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              เปลี่ยนรหัสผ่าน
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              การยืนยันตัวตน
            </CardTitle>
            <CardDescription>
              ตั้งค่าการยืนยันตัวตนแบบสองขั้นตอน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              เปิดใช้งาน 2FA
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              เซสชันที่ใช้งานอยู่
            </CardTitle>
            <CardDescription>
              ดูและจัดการเซสชันการเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              ดูเซสชันทั้งหมด
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              การเข้าถึง API
            </CardTitle>
            <CardDescription>
              จัดการ API keys และการเข้าถึง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              จัดการ API Keys
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button asChild variant="secondary">
          <Link href="/management/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าตั้งค่า
          </Link>
        </Button>
      </div>
    </div>
  );
} 
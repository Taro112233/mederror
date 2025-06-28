import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ArrowLeft, Server, Settings, Activity } from "lucide-react";
import Link from "next/link";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว และมี role เป็น ADMIN เท่านั้นที่เข้าถึงได้
export default async function SystemSettings() {
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
  if (account.role !== "ADMIN") {
    redirect("/");
  }

  // Get system statistics
  const totalUsers = await prisma.account.count();
  const totalOrganizations = await prisma.organization.count();
  const totalMedErrors = await prisma.medError.count();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ตั้งค่าระบบ</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              สถิติระบบ
            </CardTitle>
            <CardDescription>
              ข้อมูลสถิติของระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ผู้ใช้ทั้งหมด:</span>
              <span className="text-sm font-medium">{totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">องค์กรทั้งหมด:</span>
              <span className="text-sm font-medium">{totalOrganizations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Med Errors:</span>
              <span className="text-sm font-medium">{totalMedErrors}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ฐานข้อมูล
            </CardTitle>
            <CardDescription>
              จัดการฐานข้อมูลและข้อมูลระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              สำรองข้อมูล
            </Button>
            <Button variant="outline" className="w-full">
              คืนค่าข้อมูล
            </Button>
            <Button variant="outline" className="w-full">
              ล้างข้อมูล
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              การตั้งค่าเซิร์ฟเวอร์
            </CardTitle>
            <CardDescription>
              ตั้งค่าเซิร์ฟเวอร์และประสิทธิภาพ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              ตั้งค่า Cache
            </Button>
            <Button variant="outline" className="w-full">
              จัดการ Logs
            </Button>
            <Button variant="outline" className="w-full">
              ตั้งค่า Performance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              การตั้งค่าทั่วไป
            </CardTitle>
            <CardDescription>
              การตั้งค่าระบบทั่วไป
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              ตั้งค่าภาษา
            </Button>
            <Button variant="outline" className="w-full">
              ตั้งค่าโซนเวลา
            </Button>
            <Button variant="outline" className="w-full">
              ตั้งค่าการแสดงผล
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button asChild variant="secondary">
          <Link href="/admin/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าตั้งค่า
          </Link>
        </Button>
      </div>
    </div>
  );
} 
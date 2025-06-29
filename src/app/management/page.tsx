import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Code, Settings, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function ManagementMenu() {
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
  const account = await prisma.account.findUnique({ where: { id: payload.id }, include: { organization: true, user: true } });
  if (!account) {
    redirect("/login");
  }
  if (!account.onboarded) {
    redirect("/onboarding");
  }
  if (!account.role || account.role === "UNAPPROVED") {
    redirect("/pending-approval");
  }

  // กำหนดสิทธิ์การเห็นเมนู
  const isDeveloper = account.role === "DEVELOPER";
  const isAdmin = account.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ตั้งค่าทั่วไป</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {/* 1. รายการ Med error ที่ส่งไป (ทุก role เห็น) */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/management/my-records">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                รายการ Med error ที่ส่งไป
              </CardTitle>
              <CardDescription>
                ดูรายการข้อผิดพลาดที่คุณรายงาน
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        {/* 2. รายการ Med error ทั้งหมด (ADMIN, DEVELOPER) */}
        {(isAdmin || isDeveloper) && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/management/records">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    รายการ Med error ทั้งหมด
                  </CardTitle>
                  <Badge variant="destructive">ADMIN</Badge>
                </div>
                <CardDescription>
                  ดูและจัดการรายการข้อผิดพลาดทั้งหมด
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        )}
        {/* 3. รายชื่อผู้ใช้งานในระบบ (ADMIN, DEVELOPER) */}
        {(isAdmin || isDeveloper) && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/management/user">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    รายชื่อผู้ใช้งานระบบ
                  </CardTitle>
                  <Badge variant="destructive">ADMIN</Badge>
                </div>
                <CardDescription>
                  จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        )}
        {/* 4. Developer Panel (DEVELOPER) */}
        {isDeveloper && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/management/developer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Developer Panel
                  </CardTitle>
                  <Badge className="bg-purple-600 text-white">DEVELOPER</Badge>
                </div>
                <CardDescription>
                  เครื่องมือสำหรับนักพัฒนา
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        )}
        {/* 5. ตั้งค่า (ทุก role เห็น) */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/management/settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                ตั้งค่า
              </CardTitle>
              <CardDescription>
                จัดการการตั้งค่าผู้ใช้งานระบบ
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}

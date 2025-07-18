import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Code, Settings, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CardButton from "@/components/CardButton";
import { Skeleton } from "@/components/ui/skeleton";
import FileCheck2 from "@/components/common/file-check-2";

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
  // const prisma = new PrismaClient();
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

  // Add a loading state skeleton (for demonstration, always false)
  const loading = false; // Replace with real loading logic if needed
  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ตั้งค่าทั่วไป</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {/* 1. รายการ Med Error ที่ส่งไป (ทุก role เห็น) */}
        <CardButton href="/management/my-records">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5" />
              Med Error ที่ส่งไป
            </CardTitle>
            <CardDescription>
              ดูรายการข้อผิดพลาดที่คุณรายงาน
            </CardDescription>
          </CardHeader>
        </CardButton>
        {/* 2. รายการ Med Error ทั้งหมด (ADMIN, DEVELOPER) */}
        {(isAdmin || isDeveloper) && (
          <CardButton href="/management/records">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Med Error ทั้งหมด
                </CardTitle>
                <Badge variant="destructive">ADMIN</Badge>
              </div>
              <CardDescription>
                ดูและจัดการรายการข้อผิดพลาดทั้งหมด
              </CardDescription>
            </CardHeader>
          </CardButton>
        )}
        {/* 3. รายชื่อผู้ใช้งานในระบบ (ADMIN, DEVELOPER) */}
        {(isAdmin || isDeveloper) && (
          <CardButton href="/management/user">
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
          </CardButton>
        )}
        {/* 4. Developer Panel (DEVELOPER) */}
        {isDeveloper && (
          <CardButton href="/management/developer">
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
          </CardButton>
        )}
        {/* 5. ตั้งค่า (ทุก role เห็น) */}
        <CardButton href="/management/settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              ตั้งค่า
            </CardTitle>
            <CardDescription>
              จัดการการตั้งค่าผู้ใช้งานระบบ
            </CardDescription>
          </CardHeader>
        </CardButton>
      </div>
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedErrorForm, { ReporterInfoCard } from "@/components/forms/MedErrorForm";
import { useState, useEffect } from "react";
import { AlertCircleIcon } from "lucide-react";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function ReportNewPage() {
  // --- Logic ตรวจสอบ session, onboarding, approved, role ---
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">รายงานข้อผิดพลาดใหม่</h2>
      </div>
      
      {/* Layout สำหรับหน้าจอขนาดใหญ่ - แสดงข้อมูลผู้รายงานด้านขวา */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {/* ฟอร์มรายงาน - ใช้พื้นที่ 2/3 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircleIcon className="h-5 w-5" />
                รายงาน Med Error
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">กรุณากรอกรายละเอียดเหตุการณ์ความคลาดเคลื่อนทางยาให้ครบถ้วน</p>
            </CardHeader>
            <CardContent>
              <MedErrorForm />
            </CardContent>
          </Card>
        </div>
        
        {/* ข้อมูลผู้รายงาน - ใช้พื้นที่ 1/3 */}
        <div className="lg:col-span-1">
          <ReporterInfoCard 
            userInfo={{
              accountId: account.id,
              username: account.username,
              name: account.user?.name || "",
              position: account.user?.position || "",
              phone: account.user?.phone || "",
              role: account.role,
              organizationId: account.organizationId || "",
            }} 
            userLoading={false} 
          />
        </div>
      </div>

      {/* Layout สำหรับหน้าจอขนาดเล็ก - แสดงข้อมูลผู้รายงานด้านล่าง */}
      <div className="lg:hidden space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              รายงาน Med Error
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">กรุณากรอกรายละเอียดเหตุการณ์ความคลาดเคลื่อนทางยาให้ครบถ้วน</p>
          </CardHeader>
          <CardContent>
            <MedErrorForm />
          </CardContent>
        </Card>
        
        <ReporterInfoCard 
          userInfo={{
            accountId: account.id,
            username: account.username,
            name: account.user?.name || "",
            position: account.user?.position || "",
            phone: account.user?.phone || "",
            role: account.role,
            organizationId: account.organizationId || "",
          }} 
          userLoading={false} 
        />
      </div>
    </div>
  );
}

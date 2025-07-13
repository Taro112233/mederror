import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Settings, FileText, BarChart3, Bot } from "lucide-react";
import ChartNoAxesCombined from "@/components/common/chart-no-axes-combined";
import NotebookPen from "@/components/common/notebook-pen";
import CardButton from "@/components/CardButton";
import prisma from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function HomePage() {
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
  // --- END Logic ---

  // กำหนดสิทธิ์การเห็นเมนู
  const isDeveloper = account.role === "DEVELOPER";
  const isAdmin = account.role === "ADMIN";

  // Add a loading state skeleton (for demonstration, always false)
  const loading = false; // Replace with real loading logic if needed
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-6 w-1/2 mt-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ยินดีต้อนรับ</h1>
          <p className="text-muted-foreground">
            {account.organization?.name || 'ระบบรายงานความคลาดเคลื่อนทางยา'}
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ข้อมูลผู้ใช้งาน
          </CardTitle>
          <CardDescription>
            ข้อมูลส่วนตัวและสิทธิ์การเข้าถึงระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">ชื่อ-นามสกุล</div>
              <div className="text-lg font-semibold">{account.user?.name || '-'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">ตำแหน่ง</div>
              <div className="text-lg font-semibold">{account.user?.position || '-'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">สิทธิ์การเข้าถึง</div>
              <div>
                <Badge variant={
                  account.role === "ADMIN" ? "destructive" :
                    account.role === "DEVELOPER" ? "purple" :
                      "outline"
                }>
                  {account.role === "ADMIN" ? "ADMIN" :
                    account.role === "DEVELOPER" ? "DEVELOPER" :
                      "USER"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* AI Assistant (ADMIN, DEVELOPER) */}
        {(isAdmin || isDeveloper) && (
          <CardButton href="/ai-assistant">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-black" />
                  AI Assistant
                </CardTitle>
                <Badge variant="destructive">ADMIN</Badge>
              </div>
              <CardDescription>
                ถาม-ตอบกับ AI เกี่ยวกับ Med Error หรือเรื่องอื่น ๆ
              </CardDescription>
            </CardHeader>
          </CardButton>
        )}

        <CardButton href="/dashboard">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartNoAxesCombined className="h-5 w-5" />
              Dashboard
            </CardTitle>
            <CardDescription>
              ดูสถิติและข้อมูลสรุป
            </CardDescription>
          </CardHeader>
        </CardButton>

        <CardButton href="/report/new">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="h-5 w-5" />
              รายงานข้อผิดพลาด
            </CardTitle>
            <CardDescription>
              สร้างรายงานข้อผิดพลาดใหม่
            </CardDescription>
          </CardHeader>
        </CardButton>

        <CardButton href="/management">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              ตั้งค่าทั่วไป
            </CardTitle>
            <CardDescription>
              จัดการผู้ใช้และระบบ
            </CardDescription>
          </CardHeader>
        </CardButton>


      </div>

      <div className="text-xs text-muted-foreground text-center">
        * ระบบจะบันทึกข้อมูลการใช้งานในชื่อ {account.user?.name || 'ผู้ใช้งาน'}
      </div>
    </div>
  );
} 
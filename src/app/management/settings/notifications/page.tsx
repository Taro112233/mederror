import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, ArrowLeft, Mail, MessageSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function NotificationSettings() {
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
        <h2 className="text-3xl font-bold tracking-tight">การแจ้งเตือน</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            การตั้งค่าการแจ้งเตือน
          </CardTitle>
          <CardDescription>
            จัดการการแจ้งเตือนและอีเมลที่คุณต้องการรับ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <label className="text-sm font-medium">อีเมลแจ้งเตือน</label>
                </div>
                <p className="text-sm text-muted-foreground">
                  รับการแจ้งเตือนผ่านอีเมล
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <label className="text-sm font-medium">การแจ้งเตือนในระบบ</label>
                </div>
                <p className="text-sm text-muted-foreground">
                  แจ้งเตือนเมื่อมี Med Error ใหม่
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <label className="text-sm font-medium">การแจ้งเตือนความปลอดภัย</label>
                </div>
                <p className="text-sm text-muted-foreground">
                  แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex gap-2">
            <Button>บันทึกการตั้งค่า</Button>
            <Button variant="outline">ทดสอบการแจ้งเตือน</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="secondary">
          <Link href="/management/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Link>
        </Button>
      </div>
    </div>
  );
} 
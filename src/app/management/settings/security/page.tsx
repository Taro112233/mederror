import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, Lock, Shield } from "lucide-react";
import Link from "next/link";

// [SECURITY] ตรวจสอบ session token และ user permissions ในฝั่ง server
export default async function SecuritySettings() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  const securityToken = cookieStore.get("security_token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // ตรวจสอบ session token
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
  } catch {
    redirect("/login");
  }

  // ตรวจสอบว่า user onboarded และมี role ที่เหมาะสม
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

  // ตรวจสอบ security token
  if (!securityToken) {
    redirect("/management/settings/security/verify");
  }

  try {
    const securityPayload = jwt.verify(securityToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    
    if (!securityPayload.securityVerified) {
      redirect("/management/settings/security/verify");
    }

    if (securityPayload.verifiedAt) {
      const verifiedAt = new Date(securityPayload.verifiedAt);
      const now = new Date();
      const timeDiff = now.getTime() - verifiedAt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff > 15) {
        redirect("/management/settings/security/verify");
      }
    }
  } catch {
    redirect("/management/settings/security/verify");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ความปลอดภัย</h2>
        </div>
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
            <Button asChild variant="outline" className="w-full">
              <Link href="/management/settings/security/change-password">
                เปลี่ยนรหัสผ่าน
              </Link>
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
            <Button asChild variant="outline" className="w-full">
              <Link href="/management/settings/security/2fa">
                เปิดใช้งาน 2FA
              </Link>
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
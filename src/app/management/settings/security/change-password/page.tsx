import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key } from "lucide-react";
import Link from "next/link";
import ChangePasswordForm from "./ChangePasswordForm";
import { Skeleton } from "@/components/ui/skeleton";

// [SECURITY] ตรวจสอบ security token ในฝั่ง server
export default async function ChangePasswordPage() {
  const cookieStore = await cookies();
  const securityToken = cookieStore.get("security_token")?.value;

  if (!securityToken) {
    redirect("/management/settings/security/verify");
  }

  let securityPayload: jwt.JwtPayload;
  try {
    securityPayload = jwt.verify(securityToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
  } catch {
    redirect("/management/settings/security/verify");
  }

  // ตรวจสอบว่า token มี securityVerified และยังไม่หมดอายุ
  if (!securityPayload.securityVerified) {
    redirect("/management/settings/security/verify");
  }

  // ตรวจสอบว่า token ยังไม่หมดอายุ (15 นาที)
  const verifiedAt = new Date(securityPayload.verifiedAt);
  const now = new Date();
  const timeDiff = now.getTime() - verifiedAt.getTime();
  const minutesDiff = timeDiff / (1000 * 60);

  if (minutesDiff > 15) {
    redirect("/management/settings/security/verify");
  }

  // Add a loading state skeleton (for demonstration, always false)
  const loading = false; // Replace with real loading logic if needed
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">เปลี่ยนรหัสผ่าน</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            เปลี่ยนรหัสผ่าน
          </CardTitle>
          <CardDescription>
            กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่เพื่อความปลอดภัย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="secondary">
          <Link href="/management/settings/security">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Link>
        </Button>
      </div>
    </div>
  );
} 
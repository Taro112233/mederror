import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว และมี role เป็น ADMIN เท่านั้นที่เข้าถึงได้
export default async function ProfileSettings() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">โปรไฟล์ผู้ใช้</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ข้อมูลส่วนตัว
          </CardTitle>
          <CardDescription>
            จัดการข้อมูลส่วนตัวและโปรไฟล์ของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">ชื่อผู้ใช้</label>
              <p className="text-sm text-muted-foreground">{account.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium">บทบาท</label>
              <p className="text-sm text-muted-foreground">{account.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium">สถานะการลงทะเบียน</label>
              <p className="text-sm text-muted-foreground">
                {account.onboarded ? "ลงทะเบียนแล้ว" : "ยังไม่ลงทะเบียน"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">วันที่สร้างบัญชี</label>
              <p className="text-sm text-muted-foreground">
                {new Date(account.createdAt).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">แก้ไขข้อมูล</Button>
            <Button variant="outline">เปลี่ยนรูปโปรไฟล์</Button>
          </div>
        </CardContent>
      </Card>

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
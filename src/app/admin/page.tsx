import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Code, Home } from "lucide-react";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว และมี role เป็น ADMIN เท่านั้นที่เข้าถึงได้
export default async function AdminMenu() {
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
        <h2 className="text-3xl font-bold tracking-tight">จัดการระบบ</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/records">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                รายการ Med error
              </CardTitle>
              <CardDescription>
                ดูและจัดการรายการข้อผิดพลาดทั้งหมด
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/user">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                จัดการผู้ใช้
              </CardTitle>
              <CardDescription>
                จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/developer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Developer Panel
              </CardTitle>
              <CardDescription>
                เครื่องมือสำหรับนักพัฒนา
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="secondary">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </Button>
      </div>
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// [AUTH] เฉพาะผู้ใช้ที่มี role เป็น DEVELOPER เท่านั้นที่เข้าถึงได้
export default async function DeveloperPanel() {
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
  // ตรวจสอบว่าเป็น DEVELOPER เท่านั้น
  if (account.role !== "DEVELOPER") {
    redirect("/management");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Developer Panel</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สร้าง Organization ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="ชื่อ Organization"
              className="flex-1"
              disabled
            />
            <Button disabled>
              สร้าง Organization
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            ฟีเจอร์นี้จะถูกพัฒนาในอนาคต
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการ Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ฟีเจอร์นี้จะถูกพัฒนาในอนาคต
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import LogoutButton from "@/components/button/LogoutButton";

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
  // --- END Logic ---

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-0 mb-6">
        <div className="text-xl font-bold text-center">ระบบรายงานความคลาดเคลื่อนทางยา</div>
        <div className="text-xl font-bold text-center">{account.organization?.name || '-'}</div>
        <div className="mt-3 p-4 border rounded bg-muted/50 text-sm text-gray-700 w-full max-w-md">
          <div className="mb-1 font-semibold">ข้อมูลผู้ใช้งาน</div>
          <div>ชื่อ-นามสกุล: <span className="font-medium">{account.user?.name || '-'}</span></div>
          <div>ตำแหน่ง: <span className="font-medium">{account.user?.position || '-'}</span></div>
          <div className="mt-2 text-xs text-gray-500">* ระบบจะบันทึกข้อมูลการใช้งานในชื่อนี้</div>
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/dashboard">
            <span>Dashboard</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/report/new">
            <span>รายงาน Med error</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin">
            <span>Admin panel</span>
          </Link>
        </Button>
        <LogoutButton className="w-full text-lg py-6" variant="destructive" />
      </div>
    </div>
  );
}

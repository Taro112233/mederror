import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, AlertTriangle } from "lucide-react";
import DatabaseManager from "./DatabaseManager";
import { Skeleton } from "@/components/ui/skeleton";

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
  const account = await prisma.account.findUnique({
    where: { id: payload.id },
    include: { organization: true, user: true },
  });
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

  // ดึงข้อมูลสถิติฐานข้อมูล
  const [accountsCount, organizationsCount, medErrorsCount, usersCount] = await Promise.all([
    prisma.account.count(),
    prisma.organization.count(),
    prisma.medError.count(),
    prisma.user.count(),
  ]);

  const dbStats = {
    accounts: accountsCount,
    organizations: organizationsCount,
    medErrors: medErrorsCount,
    users: usersCount,
  };

  // Add a loading state skeleton (for demonstration, always false)
  const loading = false; // Replace with real loading logic if needed
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-16 w-full mt-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database Management</h2>
          <p className="text-muted-foreground">
            จัดการฐานข้อมูลระบบ - เฉพาะ Developer เท่านั้น
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm">
            <Shield className="h-3 w-3 mr-1" />
            Developer Only
          </Badge>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Accounts</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{dbStats.accounts}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            <span className="font-medium">Organizations</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{dbStats.organizations}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Med Errors</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{dbStats.medErrors}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Users</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{dbStats.users}</p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">คำเตือน</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          คุณกำลังเข้าถึงระบบจัดการฐานข้อมูลโดยตรง การเปลี่ยนแปลงใดๆ จะส่งผลต่อข้อมูลจริงในระบบ กรุณาใช้ความระมัดระวัง
        </p>
      </div>

      {/* Database Manager Component */}
      <DatabaseManager />
    </div>
  );
} 
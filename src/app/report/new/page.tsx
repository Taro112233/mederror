import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import ReportNewClient from "./ReportNewClient";
import { Skeleton } from "@/components/ui/skeleton";

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

  const userInfo = {
    accountId: account.id,
    username: account.username,
    name: account.user?.name || "",
    position: account.user?.position || "",
    phone: account.user?.phone || "",
    role: account.role,
    organizationId: account.organizationId || "",
  };

  // Add a loading state skeleton (for demonstration, always false)
  const loading = false; // Replace with real loading logic if needed
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-96 w-full mb-4" />
      </div>
    );
  }

  return <ReportNewClient userInfo={userInfo} />;
}

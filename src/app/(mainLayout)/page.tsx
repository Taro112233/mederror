import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import jwt from "jsonwebtoken";

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
  const account = await prisma.account.findUnique({ where: { id: payload.id } });
  if (!account) {
    redirect("/login");
  }
  if (!account.onboarded) {
    redirect("/onboarding");
  }
  if (!account.approved) {
    redirect("/pending-approval");
  }
  // --- END Logic ---

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold mb-8 text-center">ยินดีต้อนรับ!</h1>
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
      </div>
    </div>
  );
}

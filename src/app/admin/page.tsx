import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Menu</h1>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin/records">
            <span>รายการ Med error (admin)</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin/user">
            <span>จัดการผู้ใช้</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin/developer">
            <span>Developer Panel</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6" variant="secondary">
          <Link href="/">
            <span>กลับหน้าแรก</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

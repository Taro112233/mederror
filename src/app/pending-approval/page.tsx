import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PendingApprovalLogoutButton from "../../components/button/LogoutButton";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@/generated/prisma";

export default async function PendingApprovalPage() {
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
  if (!payload.onboarded) {
    redirect("/onboarding");
  }
  // เช็ค approved จาก database
  const prisma = new PrismaClient();
  const account = await prisma.account.findUnique({ where: { id: payload.id } });
  if (account?.approved) {
    redirect("http://localhost:3000");
  }

  // Fetch user info from DB
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { accountId: payload.id },
      select: { name: true, phone: true, position: true },
    });
  } catch {
    // fallback: user stays null
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">รอการอนุมัติ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            <li className="flex justify-between">
              <span className="font-medium">ชื่อ-นามสกุล:</span>
              <span>{user?.name || '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">เบอร์โทร:</span>
              <span>{user?.phone || '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">ตำแหน่ง:</span>
              <span>{user?.position || '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">สถานะ:</span>
              <span className="text-yellow-600 font-semibold">รอการอนุมัติ</span>
            </li>
          </ul>
          <PendingApprovalLogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}

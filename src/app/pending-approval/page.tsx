import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PendingApprovalLogoutButton from "./PendingApprovalLogoutButton";

export default async function PendingApprovalPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) {
    redirect("/login");
  }
  const accountId = sessionToken.split(".")[0];
  const prisma = new PrismaClient();
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    redirect("/login");
  }
  if (!account.onboarded) {
    redirect("/onboarding");
  }
  if (account.approved) {
    redirect("/");
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">รอการอนุมัติ</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="max-w-md mx-auto">
            <AlertDescription className="text-center">
              บัญชีของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ<br />
              กรุณารอสักครู่ หรือออกจากระบบเพื่อเข้าสู่ระบบใหม่ภายหลัง
            </AlertDescription>
          </Alert>
          <PendingApprovalLogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}

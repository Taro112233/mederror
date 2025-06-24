import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PendingApprovalLogoutButton from "../../components/button/LogoutButton";
import jwt from "jsonwebtoken";

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
  if (payload.approved) {
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

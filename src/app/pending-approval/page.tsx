import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PendingApprovalLogoutButton from "../../components/button/LogoutButton";

export default function PendingApprovalPage() {
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

'use client';
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove session_token cookie
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
  };

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
          <Button variant="default" onClick={handleLogout} className="mt-6 w-full">
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

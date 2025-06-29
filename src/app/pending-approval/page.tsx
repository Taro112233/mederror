'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LogoutButton from "../../components/button/LogoutButton";
import { Button } from "@/components/ui/button";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role เป็น UNAPPROVED เท่านั้นที่เข้าถึงได้
export default function PendingApprovalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; phone: string; position: string } | null>(null);
  const router = useRouter();

  // Fetch user info from DB
  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const userData = await res.json();
        setUser({
          name: userData.name || '-',
          phone: userData.phone || '-',
          position: userData.position || '-'
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Load user info on component mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Handle refresh button click - redirect to home page
  const handleRefresh = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Check if user is still UNAPPROVED
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const userData = await res.json();
        // If user is no longer UNAPPROVED, redirect to home
        if (userData.role !== "UNAPPROVED") {
          router.replace("http://localhost:3000");
        } else {
          // If still UNAPPROVED, just refresh the page
          window.location.reload();
        }
      } else {
        // If API call fails, redirect to home
        router.replace("http://localhost:3000");
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      // If error occurs, redirect to home
      router.replace("http://localhost:3000");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
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
            <div className="flex flex-row justify-between items-center">
              <div className="w-30">
                <LogoutButton className="w-30" variant="secondary" disabled={isLoading} />
              </div>
              <div className="flex-1" />
              <Button 
                onClick={handleRefresh} 
                className="w-30" 
                disabled={isLoading}
              >
                {isLoading ? "กำลังตรวจสอบ..." : "รีเฟรช"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

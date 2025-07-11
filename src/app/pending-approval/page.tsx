'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/ui/auth-layout";
import { motion } from "framer-motion";
import { Clock, User, Phone, Briefcase, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role เป็น UNAPPROVED เท่านั้นที่เข้าถึงได้
export default function PendingApprovalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; phone: string; position: string } | null>(null);
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  // Redirect to /login if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    }
  }, [authLoading, authUser, router]);

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
          router.replace("/home");
        } else {
          // If still UNAPPROVED, just refresh the page
          window.location.reload();
        }
      } else {
        // If API call fails, redirect to home
        router.replace("/home");
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      // If error occurs, redirect to home
      router.replace("/home");
    } finally {
      setIsLoading(false);
    }
  };

  const userInfoItems = [
    { icon: User, label: "ชื่อ-นามสกุล", value: user?.name || '-' },
    { icon: Phone, label: "เบอร์โทร", value: user?.phone || '-' },
    { icon: Briefcase, label: "ตำแหน่ง", value: user?.position || '-' },
    { icon: AlertTriangle, label: "สถานะ", value: "รอการอนุมัติ", isStatus: true }
  ];

  return (
    <AuthLayout 
      title="รอการอนุมัติ" 
      subtitle="บัญชีของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ"
      maxWidth="md"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-4"
        >
          {userInfoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{item.label}:</span>
              </div>
              <span className={`text-sm ${item.isStatus ? 'text-yellow-600 font-semibold' : 'text-foreground'}`}>
                {item.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 pt-4"
        >
          <Button 
            type="button"
            variant="secondary" 
            disabled={isLoading}
            className="flex-1 h-10"
            onClick={async () => {
              if (isLoading) return;
              try {
                await fetch('/api/logout', { method: 'POST' });
                router.replace('/login');
              } catch (error) {
                console.error('Error during logout:', error);
              }
            }}
          >
            ออกจากระบบ
          </Button>
          <Button 
            onClick={handleRefresh} 
            className="flex-1 h-10" 
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 mr-2" />
            {isLoading ? "กำลังตรวจสอบ..." : "รีเฟรช"}
          </Button>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

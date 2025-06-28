'use client';
import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import jwt from "jsonwebtoken";
import GlobalSidebar from "@/components/GlobalSidebar";

export default function LoginPage() {
  React.useEffect(() => {
    const match = document.cookie.match(/session_token=([^;]+)/);
    const sessionToken = match ? match[1] : null;
    if (sessionToken) {
      try {
        jwt.verify(sessionToken, process.env.NEXT_PUBLIC_JWT_SECRET || "dev_secret");
        window.location.replace("/");
      } catch {}
    }
  }, []);

  return (
    <GlobalSidebar showAuthLinks={true}>
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center text-sm">
              ยังไม่มีบัญชี? <Link href="/register" className="text-primary underline">สมัครสมาชิก</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </GlobalSidebar>
  );
}

"use client";
import React from "react";
import jwt from "jsonwebtoken";
import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GlobalSidebar from "@/components/GlobalSidebar";

export default function RegisterPage() {
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
            <CardTitle>สมัครสมาชิก</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-4 text-center text-sm">
              มีบัญชีอยู่แล้ว? <Link href="/login" className="text-primary underline">เข้าสู่ระบบ</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </GlobalSidebar>
  );
} 
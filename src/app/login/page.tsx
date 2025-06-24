'use client';
import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
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
  );
}

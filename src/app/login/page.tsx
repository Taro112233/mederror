import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// [AUTH] ถ้า login แล้วให้ redirect ไปหน้าหลัก
export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  
  if (sessionToken) {
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
      redirect("/");
    } catch {
      // Token ไม่ถูกต้อง ให้ลบ cookie และแสดงหน้า login
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
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
    </div>
  );
}

import React from "react";
import jwt from "jsonwebtoken";
import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// [AUTH] ถ้า login แล้วให้ redirect ไปหน้าหลัก
export default async function RegisterPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  
  if (sessionToken) {
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
      redirect("/");
    } catch {
      // Token ไม่ถูกต้อง ให้ลบ cookie และแสดงหน้า register
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
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
    </div>
  );
} 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";
import AuthLayout from "@/components/ui/auth-layout";

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
    <AuthLayout 
      title="เข้าสู่ระบบ" 
      subtitle="กรุณาเลือกหน่วยงาน หรือ องค์กรและเข้าสู่ระบบ"
    >
      <LoginForm />
      <div className="mt-6 text-center text-sm">
        ยังไม่มีบัญชี?{" "}
        <Link 
          href="/register" 
          className="text-primary underline hover:text-primary/80 transition-colors font-medium"
        >
          สมัครสมาชิก
        </Link>
      </div>
    </AuthLayout>
  );
}

import React from "react";
import jwt from "jsonwebtoken";
import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";
import AuthLayout from "@/components/ui/auth-layout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// [AUTH] ถ้า login แล้วให้ redirect ไปหน้าหลัก
export default async function RegisterPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  
  if (sessionToken) {
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
      redirect("/home");
    } catch {
      // Token ไม่ถูกต้อง ให้ลบ cookie และแสดงหน้า register
    }
  }

  return (
    <AuthLayout 
      title="สมัครสมาชิก" 
      subtitle="สร้างบัญชีใหม่เพื่อเข้าถึงระบบ"
    >
      <RegisterForm />
      <div className="mt-6 text-center text-sm">
        มีบัญชีอยู่แล้ว?{" "}
        <Link 
          href="/login" 
          className="text-primary underline hover:text-primary/80 transition-colors font-medium"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </AuthLayout>
  );
} 
'use client';
import React, { useState } from "react";
import LoginForm from "@/components/forms/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loginFailed, setLoginFailed] = useState(false);

  // ในอนาคตจะเช็คสถานะ onboarding/approval จาก backend
  const handleSuccess = () => {
    // mock: ไปหน้า onboarding
    router.push("/onboarding");
  };
  const handleFail = () => {
    setLoginFailed(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-center">เข้าสู่ระบบ</h1>
        <LoginForm onSuccess={handleSuccess} onFail={handleFail} />
        {loginFailed && (
          <div className="text-center text-red-600 mt-2">Login Failed</div>
        )}
      </div>
    </main>
  );
}

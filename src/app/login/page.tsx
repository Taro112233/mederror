'use client';
import React, { useState } from "react";
import LoginForm from "@/components/forms/loginForm/LoginForm";
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
    <div className="flex justify-center items-center min-h-screen">
      <LoginForm />
    </div>
  );
}

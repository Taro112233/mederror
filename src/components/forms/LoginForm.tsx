"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCredentialForm from "./loginForm/LoginCredentialForm";
import SangkadSelectForm from "./loginForm/SangkadSelectForm";

export default function LoginForm() {
  const [step, setStep] = useState(1);
  const [sangkad, setSangkad] = useState("");
  const router = useRouter();

  const handleSangkadSelect = (value: string) => {
    setSangkad(value);
    setStep(2);
  };

  const handleLogin = async (username: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ sangkad, username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      router.push("/");
    } else {
      alert("เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div>
      {step === 1 && <SangkadSelectForm onSelect={handleSangkadSelect} />}
      {step === 2 && (
        <LoginCredentialForm onSubmit={handleLogin} onBack={() => setStep(1)} />
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCredentialForm from "./loginForm/LoginCredentialForm";
import SangkadSelectForm from "./loginForm/SangkadSelectForm";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [sangkad, setSangkad] = useState("");
  const router = useRouter();

  const handleSangkadSelect = (value: string) => {
    setSangkad(value);
    setStep(2);
  };

  const handleRegister = async (username: string, password: string) => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ sangkad, username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      alert("สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติ");
      router.push("/login");
    } else {
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "เกิดข้อผิดพลาดที่ไม่คาดคิด (Invalid JSON response)" };
      }
      alert(data.error || "สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <div>
      {step === 1 && <SangkadSelectForm onSelect={handleSangkadSelect} />}
      {step === 2 && (
        <LoginCredentialForm onSubmit={handleRegister} onBack={() => setStep(1)} submitLabel="สมัครสมาชิก" />
      )}
    </div>
  );
} 
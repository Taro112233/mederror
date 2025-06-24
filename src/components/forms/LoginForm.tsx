"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCredentialForm from "./loginForm/LoginCredentialForm";
import OrganizationSelectForm from "./loginForm/OrganizationSelectForm";

export default function LoginForm() {
  const [step, setStep] = useState(1);
  const [organization, setOrganization] = useState("");
  const router = useRouter();

  const handleOrganizationSelect = (value: string) => {
    setOrganization(value);
    setStep(2);
  };

  const handleLogin = async (username: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ organization, username, password }),
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
      {step === 1 && <OrganizationSelectForm onSelect={handleOrganizationSelect} />}
      {step === 2 && (
        <LoginCredentialForm onSubmit={handleLogin} onBack={() => setStep(1)} />
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCredentialForm from "./LoginCredentialForm";
import OrganizationSelectForm from "./OrganizationSelectForm";

export default function LoginForm() {
  const [step, setStep] = useState(1);
  const [organization, setOrganization] = useState("");
  const router = useRouter();

  const handleOrganizationSelect = (orgId: string) => {
    setOrganization(orgId);
    setStep(2);
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, organizationId: organization }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      // สำเร็จ: redirect ตามสถานะ
      if (!data.account.onboarded) {
        router.replace("/onboarding");
      } else if (!data.account.approved) {
        router.replace("/pending-approval");
      } else {
        router.replace("/");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
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

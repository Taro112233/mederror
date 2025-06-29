"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoginCredentialForm from "./LoginCredentialForm";
import OrganizationSelectForm from "./OrganizationSelectForm";

export default function LoginForm() {
  const [step, setStep] = useState(1);
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleOrganizationSelect = (orgId: string) => {
    if (isLoading) return;
    setOrganization(orgId);
    setStep(2);
  };

  const handleLogin = async (username: string, password: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, organizationId: organization }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      // สำเร็จ: redirect ตามสถานะ
      if (!data.account.onboarded) {
        router.replace("/onboarding");
      } else if (data.account.role === "UNAPPROVED") {
        router.replace("/pending-approval");
      } else {
        router.replace("/");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {step === 1 && <OrganizationSelectForm onSelect={handleOrganizationSelect} disabled={isLoading} />}
      {step === 2 && (
        <LoginCredentialForm onSubmit={handleLogin} onBack={() => setStep(1)} disabled={isLoading} />
      )}
    </div>
  );
}

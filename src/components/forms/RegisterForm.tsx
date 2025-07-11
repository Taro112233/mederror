"use client";
import { useState } from "react";
import { toast } from "sonner";
import RegisterCredentialForm from "./RegisterCredentialForm";
import OrganizationSelectForm from "./OrganizationSelectForm";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter(); // Removed unused variable

  const handleOrganizationSelect = (value: string) => {
    if (isLoading) return;
    setOrganization(value);
    setStep(2);
  };

  const handleRegister = async (username: string, password: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          organizationId: organization,
          username,
          password,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("สมัครสมาชิกสำเร็จ");
        window.location.href = "/home";
      } else {
        toast.error("สมัครสมาชิกไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {step === 1 && (
        <OrganizationSelectForm
          onSelect={handleOrganizationSelect}
          disabled={isLoading}
        />
      )}
      {step === 2 && (
        <RegisterCredentialForm
          onSubmit={handleRegister}
          onBack={() => setStep(1)}
          disabled={isLoading}
        />
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RegisterCredentialForm from "./RegisterCredentialForm";
import OrganizationSelectForm from "./OrganizationSelectForm";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [organization, setOrganization] = useState("");
  const router = useRouter();

  const handleOrganizationSelect = (value: string) => {
    setOrganization(value);
    setStep(2);
  };

  const handleRegister = async (username: string, password: string) => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ organizationId: organization, username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      toast.success("สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติ");
      router.push("/");
    } else {
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "เกิดข้อผิดพลาดที่ไม่คาดคิด (Invalid JSON response)" };
      }
      toast.error(data.error || "สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <div>
      {step === 1 && <OrganizationSelectForm onSelect={handleOrganizationSelect} />}
      {step === 2 && (
        <RegisterCredentialForm onSubmit={handleRegister} onBack={() => setStep(1)} />
      )}
    </div>
  );
} 
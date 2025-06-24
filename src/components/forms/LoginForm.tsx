"use client";
import { useState } from "react";
import LoginCredentialForm from "./LoginCredentialForm";
import OrganizationSelectForm from "./OrganizationSelectForm";

export default function LoginForm() {
  const [step, setStep] = useState(1);

  const handleOrganizationSelect = () => {
    setStep(2);
  };

  return (
    <div>
      {step === 1 && <OrganizationSelectForm onSelect={handleOrganizationSelect} />}
      {step === 2 && (
        <LoginCredentialForm onSubmit={() => {}} onBack={() => setStep(1)} />
      )}
    </div>
  );
}

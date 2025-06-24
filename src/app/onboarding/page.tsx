'use client';
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/forms/OnboardingForm";

export default function OnboardingPage() {
  const router = useRouter();

  const handleSubmit = async (data: { name: string; phone: string; position: string }) => {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push("/");
  };

  return <OnboardingForm onSubmit={handleSubmit} />;
}

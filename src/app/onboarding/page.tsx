'use client';
import React from "react";
import OnboardingForm from "@/components/forms/OnboardingForm";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  // ในอนาคตจะเชื่อม backend ที่นี่ (บันทึกข้อมูล onboarding)
  const handleSubmit = (data: { name: string; phone: string; position: string }) => {
    // mock: ไปหน้า pending-approval
    router.push("/pending-approval");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-center">กรอกข้อมูล Onboarding</h1>
        <OnboardingForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}

'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // สมมติว่ามี API /api/onboarding
    await fetch("/api/onboarding", { method: "POST" });
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ฟอร์ม onboarding */}
      <button type="submit" disabled={loading}>บันทึก</button>
    </form>
  );
}

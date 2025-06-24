'use client';
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/forms/OnboardingForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>ลงทะเบียนข้อมูลผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}

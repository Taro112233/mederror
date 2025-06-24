import OnboardingForm from "@/components/forms/OnboardingForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>ลงทะเบียนข้อมูลผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}

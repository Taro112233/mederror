import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import OnboardingForm from "@/components/forms/OnboardingForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) {
    redirect("/login");
  }
  const accountId = sessionToken.split(".")[0];
  const prisma = new PrismaClient();
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    redirect("/login");
  }
  if (account.onboarded) {
    redirect("/");
  }

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

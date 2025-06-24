import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import OnboardingForm from "@/components/forms/OnboardingForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import jwt from "jsonwebtoken";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) {
    redirect("/login");
  }
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
  } catch {
    redirect("/login");
  }
  if (payload.onboarded) {
    redirect("/");
  }
  const accountId = payload.id;
  if (!accountId) {
    redirect("/login");
  }
  const prisma = new PrismaClient();
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    redirect("/login");
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

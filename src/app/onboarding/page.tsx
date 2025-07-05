import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import OnboardingForm from "@/components/forms/OnboardingForm";
import AuthLayout from "@/components/ui/auth-layout";
import jwt from "jsonwebtoken";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว และยังไม่ได้ onboarded เท่านั้นที่เข้าถึงได้
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
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    redirect("/login");
  }

  return (
    <AuthLayout 
      title="ลงทะเบียนข้อมูลผู้ใช้" 
      subtitle="กรุณากรอกข้อมูลส่วนตัวเพื่อดำเนินการต่อ"
      maxWidth="lg"
    >
      <OnboardingForm />
    </AuthLayout>
  );
}

import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>สมัครสมาชิก</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            มีบัญชีอยู่แล้ว? <Link href="/login" className="text-primary underline">เข้าสู่ระบบ</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
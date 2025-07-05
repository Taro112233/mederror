import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import React from "react";
import SelectOrgForm from "@/components/forms/SelectOrgForm";
import { useRouter } from "next/navigation";
import GlobalSidebar from "@/components/GlobalSidebar";

// [AUTH] ถ้า login แล้วให้ redirect ไปหน้าหลัก
export default async function SelectOrganizationPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  
  if (sessionToken) {
    try {
      jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret");
      redirect("/");
    } catch {
      // Token ไม่ถูกต้อง ให้ลบ cookie และแสดงหน้า select organization
    }
  }

  return (
    <GlobalSidebar>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">เลือกองค์กร</h1>
            <p className="text-muted-foreground">
              กรุณาเลือกองค์กรที่คุณต้องการเข้าถึง
            </p>
          </div>
          <SelectOrgForm onSelect={() => {}} />
        </div>
      </div>
    </GlobalSidebar>
  );
}

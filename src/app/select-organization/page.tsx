'use client';
import React from "react";
import SelectOrgForm from "@/components/forms/SelectOrgForm";
import { useRouter } from "next/navigation";
import GlobalSidebar from "@/components/GlobalSidebar";

export default function SelectOrganizationPage() {
  const router = useRouter();

  // ในอนาคตสามารถเชื่อม backend ที่นี่ (เช่น save orgId ใน context หรือ cookie)
  const handleSelect = () => {
    // mock: ไปหน้า login
    router.push("/login");
  };

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
          <SelectOrgForm onSelect={handleSelect} />
        </div>
      </div>
    </GlobalSidebar>
  );
}

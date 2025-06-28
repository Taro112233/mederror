'use client';
import React from "react";
import SelectOrgForm from "@/components/forms/SelectOrgForm";
import { useRouter } from "next/navigation";
import GlobalSidebar from "@/components/GlobalSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SelectOrganizationPage() {
  const router = useRouter();

  // ในอนาคตสามารถเชื่อม backend ที่นี่ (เช่น save orgId ใน context หรือ cookie)
  const handleSelect = () => {
    // mock: ไปหน้า login
    router.push("/login");
  };

  return (
    <GlobalSidebar showAuthLinks={true}>
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">เลือกสังกัด</CardTitle>
          </CardHeader>
          <CardContent>
            <SelectOrgForm onSelect={handleSelect} />
          </CardContent>
        </Card>
      </div>
    </GlobalSidebar>
  );
}

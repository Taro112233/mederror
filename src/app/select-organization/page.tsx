'use client';
import React from "react";
import SelectOrgForm from "@/components/forms/SelectOrgForm";
import { useRouter } from "next/navigation";

export default function SelectOrganizationPage() {
  const router = useRouter();

  // ในอนาคตสามารถเชื่อม backend ที่นี่ (เช่น save orgId ใน context หรือ cookie)
  const handleSelect = () => {
    // mock: ไปหน้า login
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-center">เลือกสังกัด</h1>
        <SelectOrgForm onSelect={handleSelect} />
      </div>
    </main>
  );
}

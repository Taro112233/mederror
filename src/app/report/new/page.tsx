"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedErrorForm from "@/components/forms/MedErrorForm";

export default function ReportNewPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">รายงานข้อผิดพลาดใหม่</h2>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>รายงาน Med error</CardTitle>
        </CardHeader>
        <CardContent>
          <MedErrorForm />
        </CardContent>
      </Card>
    </div>
  );
}

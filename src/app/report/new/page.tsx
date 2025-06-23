"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedErrorForm from "@/components/forms/MedErrorForm";

export default function ReportNewPage() {
  return (
    <div className="max-w-xl mx-auto w-full p-4 sm:p-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">รายงาน Med error</CardTitle>
        </CardHeader>
        <CardContent>
          <MedErrorForm />
        </CardContent>
      </Card>
    </div>
  );
}

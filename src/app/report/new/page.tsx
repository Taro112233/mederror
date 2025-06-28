"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedErrorForm, { ReporterInfoCard } from "@/components/forms/MedErrorForm";
import { useState, useEffect } from "react";

export default function ReportNewPage() {
  const [userInfo, setUserInfo] = useState<
    | { accountId: string; username: string; name: string; position: string; phone: string; role: string; organizationId: string }
    | null
  >(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setUserInfo({
          accountId: data.accountId,
          username: data.username,
          name: data.name,
          position: data.position,
          phone: data.phone,
          role: data.role,
          organizationId: data.organizationId,
        });
        setUserLoading(false);
      })
      .catch(() => setUserLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">รายงานข้อผิดพลาดใหม่</h2>
      </div>
      
      {/* Layout สำหรับหน้าจอขนาดใหญ่ - แสดงข้อมูลผู้รายงานด้านขวา */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {/* ฟอร์มรายงาน - ใช้พื้นที่ 2/3 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>รายงาน Med error</CardTitle>
            </CardHeader>
            <CardContent>
              <MedErrorForm />
            </CardContent>
          </Card>
        </div>
        
        {/* ข้อมูลผู้รายงาน - ใช้พื้นที่ 1/3 */}
        <div className="lg:col-span-1">
          <ReporterInfoCard userInfo={userInfo} userLoading={userLoading} />
        </div>
      </div>

      {/* Layout สำหรับหน้าจอขนาดเล็ก - แสดงข้อมูลผู้รายงานด้านล่าง */}
      <div className="lg:hidden space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>รายงาน Med error</CardTitle>
          </CardHeader>
          <CardContent>
            <MedErrorForm />
          </CardContent>
        </Card>
        
        <ReporterInfoCard userInfo={userInfo} userLoading={userLoading} />
      </div>
    </div>
  );
}

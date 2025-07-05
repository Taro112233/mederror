"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedErrorForm, { ReporterInfoCard } from "@/components/forms/MedErrorForm";
import { AlertCircleIcon } from "lucide-react";

interface UserInfo {
  accountId: string;
  username: string;
  name: string;
  position: string;
  phone: string;
  role: string;
  organizationId: string;
}

interface ReportNewClientProps {
  userInfo: UserInfo;
}

export default function ReportNewClient({ userInfo }: ReportNewClientProps) {
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
              <CardTitle className="flex items-center gap-2">
                <AlertCircleIcon className="h-5 w-5" />
                รายงาน Med Error
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">กรุณากรอกรายละเอียดเหตุการณ์ความคลาดเคลื่อนทางยาให้ครบถ้วน</p>
            </CardHeader>
            <CardContent>
              <MedErrorForm />
            </CardContent>
          </Card>
        </div>
        
        {/* ข้อมูลผู้รายงาน - ใช้พื้นที่ 1/3 */}
        <div className="lg:col-span-1">
          <ReporterInfoCard userInfo={userInfo} userLoading={false} />
        </div>
      </div>

      {/* Layout สำหรับหน้าจอขนาดเล็ก - แสดงข้อมูลผู้รายงานด้านล่าง */}
      <div className="lg:hidden space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              รายงาน Med Error
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">กรุณากรอกรายละเอียดเหตุการณ์ความคลาดเคลื่อนทางยาให้ครบถ้วน</p>
          </CardHeader>
          <CardContent>
            <MedErrorForm />
          </CardContent>
        </Card>
        
        <ReporterInfoCard userInfo={userInfo} userLoading={false} />
      </div>
    </div>
  );
} 
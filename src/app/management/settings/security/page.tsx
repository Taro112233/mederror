"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, Lock } from "lucide-react";
import Link from "next/link";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ความปลอดภัย</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              เปลี่ยนรหัสผ่าน
            </CardTitle>
            <CardDescription>
              อัปเดตรหัสผ่านของคุณเพื่อความปลอดภัย
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/management/settings/security/change-password">
                เปลี่ยนรหัสผ่าน
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              การยืนยันตัวตน
            </CardTitle>
            <CardDescription>
              ตั้งค่าการยืนยันตัวตนแบบสองขั้นตอน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/management/settings/security/2fa">
                เปิดใช้งาน 2FA
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button asChild variant="secondary">
          <Link href="/management/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าตั้งค่า
          </Link>
        </Button>
      </div>
    </div>
  );
} 
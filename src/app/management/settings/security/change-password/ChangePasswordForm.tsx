"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    // Validate passwords (client-side)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
        return;
      }
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      router.push("/management/settings/security");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    router.push("/management/settings/security");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-1">
        <div>
          <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
              className="mt-1 pr-10"
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              className="mt-1 pr-10"
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              className="mt-1 pr-10"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleChangePassword} 
          disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isChangingPassword ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          ยกเลิก
        </Button>
      </div>
    </div>
  );
} 
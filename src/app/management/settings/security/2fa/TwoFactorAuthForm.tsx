"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Shield, Smartphone, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function TwoFactorAuthForm() {
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // For QR code display
  const [secretKey, setSecretKey] = useState(""); // For manual entry
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const router = useRouter();

  const handleSetup2FA = async () => {
    setIsEnabling2FA(true);
    try {
      // TODO: Implement 2FA setup API call
      // const response = await fetch("/api/users/setup-2fa", {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate response data
      setQrCodeUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
      setSecretKey("JBSWY3DPEHPK3PXP");
      setStep("verify");
      toast.success("กรุณาสแกน QR Code หรือใส่ Secret Key ในแอป Authenticator");
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast.error("เกิดข้อผิดพลาดในการตั้งค่า 2FA");
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      toast.error("กรุณากรอกรหัสยืนยัน");
      return;
    }

    setIsEnabling2FA(true);
    try {
      // TODO: Implement 2FA verification API call
      // const response = await fetch("/api/users/verify-2fa", {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     code: verificationCode,
      //   }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("เปิดใช้งาน 2FA สำเร็จ");
      router.push("/management/settings/security");
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      toast.error("รหัสยืนยันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleCancel = () => {
    router.push("/management/settings/security");
  };

  return (
    <div className="space-y-6">
      {step === "setup" ? (
        <>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">ประโยชน์ของ 2FA</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    การยืนยันตัวตนแบบสองขั้นตอนจะช่วยป้องกันบัญชีของคุณจากผู้ไม่หวังดี 
                    แม้ว่าจะมีคนรู้รหัสผ่านของคุณแล้วก็ตาม
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">สิ่งที่ต้องเตรียม</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    คุณจะต้องมีแอป Authenticator เช่น Google Authenticator, 
                    Microsoft Authenticator หรือ Authy บนมือถือของคุณ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSetup2FA} 
              disabled={isEnabling2FA}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {isEnabling2FA ? "กำลังตั้งค่า..." : "เริ่มตั้งค่า 2FA"}
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
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">ขั้นตอนที่ 1: สแกน QR Code</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50 flex justify-center">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for 2FA" 
                    className="w-48 h-48 border"
                  />
                ) : (
                  <div className="w-48 h-48 border flex items-center justify-center text-gray-500">
                    QR Code จะแสดงที่นี่
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">ขั้นตอนที่ 2: ใส่ Secret Key (ทางเลือก)</Label>
              <p className="text-sm text-muted-foreground mt-1">
                หากไม่สามารถสแกน QR Code ได้ ให้ใส่ Secret Key นี้ในแอป Authenticator:
              </p>
              <div className="mt-2 p-3 bg-gray-100 rounded border font-mono text-sm">
                {secretKey || "Secret Key จะแสดงที่นี่"}
              </div>
            </div>

            <div>
              <Label htmlFor="verificationCode" className="text-sm font-medium">
                ขั้นตอนที่ 3: ยืนยันรหัส
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                ใส่รหัส 6 หลักจากแอป Authenticator เพื่อยืนยันการตั้งค่า:
              </p>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-2 max-w-xs"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleVerify2FA} 
              disabled={isEnabling2FA || !verificationCode}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isEnabling2FA ? "กำลังยืนยัน..." : "ยืนยันและเปิดใช้งาน 2FA"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep("setup")}
              disabled={isEnabling2FA}
            >
              กลับไปขั้นตอนก่อนหน้า
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 
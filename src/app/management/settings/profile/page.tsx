"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ArrowLeft, Edit, Save, X } from "lucide-react";
import Link from "next/link";

interface Account {
  id: string;
  username: string;
  role: string;
  onboarded: boolean;
  createdAt: string;
  name: string;
  position: string;
  phone: string;
}

export default function ProfileSettings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    position: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (data.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setAccount(data);
        setFormData({
          username: data.username || "",
          name: data.name || "",
          position: data.position || "",
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Error fetching account:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: account?.username || "",
      name: account?.name || "",
      position: account?.position || "",
      phone: account?.phone || "",
    });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving data:", formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">โปรไฟล์ผู้ใช้</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ข้อมูลส่วนตัว
          </CardTitle>
          <CardDescription>
            จัดการข้อมูลส่วนตัวและโปรไฟล์ของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Username</Label>
              {isEditing ? (
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{account.username}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">ชื่อ-นามสกุล</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{account.name || "ไม่ระบุ"}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">ตำแหน่ง</Label>
              {isEditing ? (
                <Input
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{account.position || "ไม่ระบุ"}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">เบอร์โทรศัพท์</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{account.phone || "ไม่ระบุ"}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">สถานะ</Label>
              <p className="text-sm text-muted-foreground mt-1">{account.role}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  บันทึก
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  ยกเลิก
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                แก้ไขข้อมูล
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
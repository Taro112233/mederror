"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, ArrowLeft, Edit, Save, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${account?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          position: formData.position,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success("แก้ไขข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแล");
      setShowConfirmDialog(false);
      setIsEditing(false);
      
      // Redirect to pending approval page
      router.push("/pending-approval");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setIsSaving(false);
    }
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
            ย้อนกลับ
          </Link>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการแก้ไขข้อมูล</DialogTitle>
            <DialogDescription>
              หากแก้ไขข้อมูล จำเป็นต้องได้รับการยืนยันจากผู้ดูแลอีกครั้ง
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? "กำลังบันทึก..." : "ยืนยันแก้ไขข้อมูล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
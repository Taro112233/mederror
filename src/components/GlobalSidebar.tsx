"use client"

import React, { ReactNode, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import LogoutButton from "@/components/button/LogoutButton";
import { 
  FileText, 
  Settings,
  Home,
  User,
  Code,
  Bell,
  Shield,
  Key,
  MessageCircle,
  Bot,
  Database
} from "lucide-react";
import ChartNoAxesCombined from "@/components/common/chart-no-axes-combined";
import NotebookPen from "@/components/common/notebook-pen";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GlobalSidebarProps {
  children: ReactNode;
}

interface UserInfo {
  name: string;
  position: string;
  organizationName?: string;
}

export default function GlobalSidebar({ children }: GlobalSidebarProps) {
  const pathname = usePathname();
  const { user, isAdminOrDeveloper } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ใช้ข้อมูลจาก useAuth hook แทน
    if (user) {
      setUserInfo({
        name: user.name,
        position: user.position,
        organizationName: user.organizationName,
      });
    }
  }, [user]);

  const handleSendFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedback }),
      });
      if (res.ok) {
        toast.success('ส่ง Feedback สำเร็จ ขอบคุณสำหรับความคิดเห็น!');
        setFeedback('');
        setFeedbackOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'เกิดข้อผิดพลาดในการส่ง Feedback');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // Function to get breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const items = [];
    // Always add home
    items.push({
      label: "หน้าแรก",
      href: "/home",
      icon: <Home className="h-4 w-4" />,
      isCurrent: pathname === "/home"
    });

    // AI Assistant (global, not under management)
    if (pathname === "/ai-assistant") {
      items.push({
        label: (
          <span className="flex items-center gap-1">
            AI Assistant
          </span>
        ),
        href: "/ai-assistant",
        icon: <Bot className="h-4 w-4 text-black" />, isCurrent: true
      });
    }
    // Dashboard
    else if (pathname === "/dashboard") {
      items.push({
        label: "Dashboard",
        href: "/dashboard",
        icon: <ChartNoAxesCombined className="h-4 w-4" />,
        isCurrent: true
      });
    }
    // Report
    else if (pathname === "/report/new") {
      items.push({
        label: "รายงานข้อผิดพลาดใหม่",
        href: "/report/new",
        icon: <NotebookPen className="h-4 w-4" />,
        isCurrent: true
      });
    }
    // Management
    else if (pathname.startsWith("/management")) {
      items.push({
        label: "ตั้งค่าทั่วไป",
        href: "/management",
        icon: <Settings className="h-4 w-4" />,
        isCurrent: pathname === "/management"
      });
      // Management subpages
      if (pathname === "/management/my-records") {
        items.push({
          label: "Med Error ที่ส่งไป",
          href: "/management/my-records",
          icon: <FileText className="h-4 w-4" />,
          isCurrent: true
        });
      } else if (pathname === "/management/records") {
        items.push({
          label: "Med Error ทั้งหมด",
          href: "/management/records",
          icon: <Database className="h-4 w-4" />,
          isCurrent: true
        });
      } else if (pathname === "/management/user") {
        items.push({
          label: "รายชื่อผู้ใช้งานระบบ",
          href: "/management/user",
          icon: <User className="h-4 w-4" />,
          isCurrent: true
        });
      } else if (pathname === "/management/ai-assistant") {
        items.push({
          label: (
            <span className="flex items-center gap-1">
              AI Assistant
            </span>
          ),
          href: "/management/ai-assistant",
          icon: <Bot className="h-4 w-4 text-black" />, isCurrent: true
        });
      } else if (pathname === "/management/developer") {
        items.push({
          label: "Developer Panel",
          href: "/management/developer",
          icon: <Code className="h-4 w-4" />,
          isCurrent: true
        });
      } else if (pathname.startsWith("/management/settings")) {
        items.push({
          label: "ตั้งค่าผู้ใช้งาน",
          href: "/management/settings",
          icon: <Settings className="h-4 w-4" />,
          isCurrent: pathname === "/management/settings"
        });
        // Management/settings subpages
        if (pathname === "/management/settings/profile") {
          items.push({
            label: "โปรไฟล์ผู้ใช้",
            href: "/management/settings/profile",
            icon: <User className="h-4 w-4" />,
            isCurrent: true
          });
        } else if (pathname.startsWith("/management/settings/security")) {
          items.push({
            label: "ความปลอดภัย",
            href: "/management/settings/security",
            icon: <Shield className="h-4 w-4" />,
            isCurrent: pathname === "/management/settings/security"
          });
          if (pathname === "/management/settings/security/change-password") {
            items.push({
              label: "เปลี่ยนรหัสผ่าน",
              href: "/management/settings/security/change-password",
              icon: <Key className="h-4 w-4" />,
              isCurrent: true
            });
          } else if (pathname === "/management/settings/security/2fa") {
            items.push({
              label: "2FA",
              href: "/management/settings/security/2fa",
              icon: <Shield className="h-4 w-4" />,
              isCurrent: true
            });
          } else if (pathname === "/management/settings/security/verify") {
            items.push({
              label: "ยืนยันรหัสผ่าน",
              href: "/management/settings/security/verify",
              icon: <Shield className="h-4 w-4" />,
              isCurrent: true
            });
          }
        } else if (pathname === "/management/settings/notifications") {
          items.push({
            label: "การแจ้งเตือน",
            href: "/management/settings/notifications",
            icon: <Bell className="h-4 w-4" />,
            isCurrent: true
          });
        }
      }
    }
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex flex-col gap-1">
                <div className="font-bold">ระบบรายงานความคลาดเคลื่อนทางยา</div>
                <div className="text-xs font-normal">
                  {userInfo?.organizationName || 'ระบบจัดการข้อผิดพลาดทางการแพทย์'}
                </div>
              </div>
            </SidebarGroupLabel>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/home">
                    <Home />
                    <span>หน้าแรก</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* AI Assistant for ADMIN and DEVELOPER - now in main menu */}
              {isAdminOrDeveloper && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/ai-assistant"}>
                    <Link href="/ai-assistant" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <Bot className="text-black h-4 w-4" />
                        <span>AI Assistant</span>
                      </span>
                      {user?.role === "ADMIN" && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-red-500 text-white leading-none">ADMIN</span>
                      )}
                      {user?.role === "DEVELOPER" && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-red-500 text-white leading-none">ADMIN</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <ChartNoAxesCombined />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/report/new"}>
                  <Link href="/report/new">
                    <NotebookPen />
                    <span>รายงานข้อผิดพลาด</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/management")}>
                  <Link href="/management">
                    <Settings />
                    <span>ตั้งค่าทั่วไป</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Feedback Button in main menu */}
              <SidebarMenuItem>
                <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton isActive={false}>
                      <MessageCircle />
                      <span>Feedback</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Feedback</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      placeholder="พิมพ์ความคิดเห็น ข้อเสนอแนะ หรือปัญหาที่พบ เพื่อช่วยให้เราพัฒนาระบบให้ดียิ่งขึ้น..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      disabled={loading}
                      className="mt-2"
                    />
                    <DialogFooter>
                      <Button onClick={handleSendFeedback} disabled={loading || !feedback.trim()}>
                        {loading ? 'กำลังส่ง...' : 'ส่ง Feedback'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          {/* เมนูสำหรับ Admin และ Developer เท่านั้น */}
          {isAdminOrDeveloper && (
            <SidebarGroup>
              <SidebarGroupLabel>จัดการระบบ</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/management/user"}>
                    <Link href="/management/user" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>จัดการผู้ใช้</span>
                      </span>
                      {user?.role === "ADMIN" && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-red-500 text-white leading-none">ADMIN</span>
                      )}
                      {user?.role === "DEVELOPER" && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-red-500 text-white leading-none">ADMIN</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/management/records"}>
                    <Link href="/management/records" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>ข้อมูลทั้งหมด</span>
                      </span>
                      {user?.role === "ADMIN" && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-red-500 text-white leading-none">ADMIN</span>
                      )}
                      {user?.role === "DEVELOPER" && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-red-500 text-white leading-none">ADMIN</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* AI Assistant for ADMIN and DEVELOPER */}
                {/* (Removed from this section as per new requirements) */}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            {userInfo && (
              <div className="px-2 py-2 border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 py-1">
                  <User className="h-4 w-4 text-sidebar-foreground" />
                  <div className="flex flex-col min-w-0">
                    <div className="text-sm font-medium text-sidebar-foreground truncate">
                      {userInfo.name}
                    </div>
                    <div className="text-xs text-sidebar-foreground/70 truncate">
                      {userInfo.position}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex justify-center items-center w-full mt-4">
                  <LogoutButton className="w-40" variant="destructive" />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header
          className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
          style={{ background: 'linear-gradient(90deg, oklch(85.5% 0.138 181.071), oklch(74.6% 0.16 232.661))', color: 'var(--header-foreground)' }}
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.isCurrent ? (
                          <BreadcrumbPage className="flex items-center gap-1">
                            {item.icon}
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href} className="flex items-center gap-1">
                            {item.icon}
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </>
  );
} 
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
  LayoutDashboard, 
  FileText, 
  Settings,
  Home,
  User,
  UserCheck,
  Code,
  Bell,
  Shield,
  Key
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.name && data.position) {
          setUserInfo({
            name: data.name,
            position: data.position,
            organizationName: data.organizationName,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user info:", error);
      });
  }, []);

  // Function to get breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const items = [];
    // Always add home
    items.push({
      label: "หน้าแรก",
      href: "/",
      icon: <Home className="h-4 w-4" />,
      isCurrent: pathname === "/"
    });

    // Dashboard
    if (pathname === "/dashboard") {
      items.push({
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        isCurrent: true
      });
    }
    // Report
    else if (pathname === "/report/new") {
      items.push({
        label: "รายงานข้อผิดพลาดใหม่",
        href: "/report/new",
        icon: <FileText className="h-4 w-4" />,
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
          label: "รายการ Med error ที่ส่งไป",
          href: "/management/my-records",
          icon: <UserCheck className="h-4 w-4" />,
          isCurrent: true
        });
      } else if (pathname === "/management/records") {
        items.push({
          label: "รายการ Med error ทั้งหมด",
          href: "/management/records",
          icon: <FileText className="h-4 w-4" />,
          isCurrent: true
        });
      } else if (pathname === "/management/user") {
        items.push({
          label: "รายชื่อผู้ใช้งานระบบ",
          href: "/management/user",
          icon: <User className="h-4 w-4" />,
          isCurrent: true
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
                <div>ระบบรายงานความคลาดเคลื่อนทางยา</div>
                <div className="text-xs text-muted-foreground font-normal">
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
                  <Link href="/">
                    <Home />
                    <span>หน้าแรก</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/report/new"}>
                  <Link href="/report/new">
                    <FileText />
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
            </SidebarMenu>
          </SidebarGroup>
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
                <LogoutButton className="w-full justify-start" variant="ghost" />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
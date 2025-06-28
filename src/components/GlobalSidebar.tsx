"use client"

import { ReactNode, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
  Users, 
  Settings,
  BarChart3,
  Home,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")}>
                  <Link href="/admin">
                    <Settings />
                    <span>จัดการระบบ</span>
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
              <span className="text-sm font-medium">
                ระบบรายงานความคลาดเคลื่อนทางยา
              </span>
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
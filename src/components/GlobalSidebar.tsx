"use client"

import { ReactNode } from "react";
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
  UserPlus,
  LogIn
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface GlobalSidebarProps {
  children: ReactNode;
  showAuthLinks?: boolean;
}

export default function GlobalSidebar({ children, showAuthLinks = false }: GlobalSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>ระบบรายงานความคลาดเคลื่อนทางยา</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="text-xs text-muted-foreground">
                ระบบจัดการข้อผิดพลาดทางการแพทย์
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
          {showAuthLinks ? (
            // Auth pages sidebar
            <SidebarGroup>
              <SidebarGroupLabel>เข้าสู่ระบบ</SidebarGroupLabel>
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
                  <SidebarMenuButton asChild isActive={pathname === "/login"}>
                    <Link href="/login">
                      <LogIn />
                      <span>เข้าสู่ระบบ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/register"}>
                    <Link href="/register">
                      <UserPlus />
                      <span>สมัครสมาชิก</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          ) : (
            // Main app sidebar
            <>
              <SidebarGroup>
                <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
                <SidebarMenu>
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
            </>
          )}
        </SidebarContent>
        {!showAuthLinks && (
          <SidebarFooter>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <LogoutButton className="w-full justify-start" variant="ghost" />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {showAuthLinks ? "ระบบรายงานความคลาดเคลื่อนทางยา" : "Dashboard"}
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
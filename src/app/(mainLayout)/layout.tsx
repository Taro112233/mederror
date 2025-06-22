import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Hamburger trigger for mobile */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SidebarTrigger />
        </div>
        <Sidebar className="bg-white border-r">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton>Dashboard</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/report/new">
                <SidebarMenuButton>รายงาน Med error</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/user">
                <SidebarMenuButton>Admin panel</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}

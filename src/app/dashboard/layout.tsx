"use client"

import { ReactNode } from "react";
import GlobalSidebar from "@/components/GlobalSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <GlobalSidebar>{children}</GlobalSidebar>;
}
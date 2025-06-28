import { ReactNode } from "react";
import GlobalSidebar from "@/components/GlobalSidebar";

export default function ReportLayout({ children }: { children: ReactNode }) {
  return (
    <GlobalSidebar showAuthLinks={false}>
      {children}
    </GlobalSidebar>
  );
} 
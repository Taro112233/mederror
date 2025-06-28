import { ReactNode } from "react";
import GlobalSidebar from "@/components/GlobalSidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <GlobalSidebar showAuthLinks={true}>
      {children}
    </GlobalSidebar>
  );
}
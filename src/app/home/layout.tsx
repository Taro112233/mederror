import GlobalSidebar from "@/components/GlobalSidebar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <GlobalSidebar>{children}</GlobalSidebar>;
} 
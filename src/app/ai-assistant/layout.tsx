import GlobalSidebar from "@/components/GlobalSidebar";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GlobalSidebar>{children}</GlobalSidebar>;
} 
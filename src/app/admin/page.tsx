import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminMenu() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Menu</h1>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin/records">
            <span>รายการ Med error (admin)</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin/user">
            <span>จัดการผู้ใช้</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6" variant="secondary">
          <Link href="/">
            <span>กลับหน้าแรก</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

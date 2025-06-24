import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold mb-8 text-center">ยินดีต้อนรับ!</h1>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/dashboard">
            <span>Dashboard</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/report/new">
            <span>รายงาน Med error</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/admin">
            <span>Admin panel</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

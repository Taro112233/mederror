'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PendingApprovalLogoutButton() {
  const router = useRouter();
  const handleLogout = () => {
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.replace('/login');
  };
  return (
    <Button variant="default" onClick={handleLogout} className="mt-6 w-full">
      ออกจากระบบ
    </Button>
  );
} 
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };
  return (
    <Button variant="default" onClick={handleLogout} className="mt-6 w-full">
      ออกจากระบบ
    </Button>
  );
} 
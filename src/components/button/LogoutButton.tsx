'use client';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };
  return (
    <Button variant="default" onClick={handleLogout} className={`w-full ${className}`}>
      ออกจากระบบ
    </Button>
  );
} 
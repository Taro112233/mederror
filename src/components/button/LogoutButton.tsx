'use client';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function LogoutButton({ className = "", variant = "default" }: { className?: string, variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };
  return (
    <Button variant={variant} onClick={handleLogout} className={`w-full ${className}`}>
      ออกจากระบบ
    </Button>
  );
} 
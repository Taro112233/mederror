'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function LogoutButton({ 
  className = "", 
  variant = "default",
  disabled = false
}: { 
  className?: string, 
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link",
  disabled?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      onClick={handleLogout} 
      className={`w-full ${className}`}
      disabled={isLoading || disabled}
    >
      {isLoading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </Button>
  );
} 
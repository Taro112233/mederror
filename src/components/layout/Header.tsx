"use client";
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

export default function Header() {
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('contact');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full flex items-center justify-between py-4 px-2 md:px-6 backdrop-blur overflow-hidden"
    >
      <div className="absolute inset-0 w-screen h-full bg-[linear-gradient(90deg,_oklch(85.5%_0.138_181.071),_oklch(74.6%_0.16_232.661))] pointer-events-none -z-10" />
      <div className="font-bold text-3xl px-4 flex items-center gap-2">
        Med Error
      </div>
      <nav className="flex items-center gap-x-2">
        <Button asChild variant="ghost" size="default">
          <a href="#contact" onClick={handleContactClick}>ติดต่อเรา</a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh"
          disabled={isRefreshing}
          onClick={async () => {
            if (isRefreshing) return;
            setIsRefreshing(true);
            try {
              await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
              });
              // Clear all cookies (client-side, just in case)
              document.cookie.split(';').forEach(cookie => {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
              });
              window.location.reload();
            } catch (error) {
              console.error('Error during refresh/logout:', error);
              setIsRefreshing(false);
            }
          }}
        >
          <RotateCcw className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </nav>
    </motion.header>
  );
} 
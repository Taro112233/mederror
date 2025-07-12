"use client";
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export default function Header() {
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('contact');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full flex items-center justify-between py-4 px-2 md:px-6 backdrop-blur overflow-hidden"
    >
      <div className="absolute inset-0 w-screen h-full bg-[linear-gradient(90deg,_oklch(92.4%_0.12_95.746),_oklch(83.7%_0.128_66.29))] pointer-events-none -z-10" />
      <div className="font-bold text-3xl px-4 flex items-center gap-2">
        <Globe className="h-8 w-8 text-primary" />
        Med Error
      </div>
      <nav className="space-x-6 px-4">
        <a href="#contact" className="hover:underline" onClick={handleContactClick}>ติดต่อเรา</a>
      </nav>
    </motion.header>
  );
} 
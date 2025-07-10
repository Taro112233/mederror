"use client";
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full flex items-center justify-between py-4 px-2 md:px-6"
    >
      <div className="font-bold text-xl">ระบบรายงานความคลาดเคลื่อนทางยา</div>
      <nav className="space-x-6">
        <a href="#hero" className="hover:underline">หน้าแรก</a>
        <a href="#features" className="hover:underline">ฟีเจอร์</a>
        <a href="#about" className="hover:underline">เกี่ยวกับ</a>
        <a href="#contact" className="hover:underline">ติดต่อ</a>
      </nav>
    </motion.header>
  );
} 
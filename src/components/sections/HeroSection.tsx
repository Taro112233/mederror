"use client";

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section id="hero" className="w-full flex flex-col items-center justify-center text-center py-16">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-2xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
      >
        ระบบรายงานความคลาดเคลื่อนทางยา
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl"
      >
        แพลตฟอร์มสำหรับรายงาน วิเคราะห์ และป้องกันความคลาดเคลื่อนทางยา เพิ่มความปลอดภัยและประสิทธิภาพในองค์กรของคุณ
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          asChild
          size="lg"
          className="px-8 py-3 text-lg font-semibold shadow-lg"
        >
          <a href="/login">เริ่มใช้งาน</a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="px-8 py-3 text-lg font-semibold shadow-lg"
        >
          <a href="#" target="_blank" rel="noopener noreferrer">Download iOS</a>
        </Button>
      </motion.div>
    </section>
  );
} 
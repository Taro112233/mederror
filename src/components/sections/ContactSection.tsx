"use client";

import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section id="contact" className="w-full flex flex-col items-center py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        ติดต่อเรา
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-md bg-card/70 rounded-lg p-6 shadow flex flex-col items-center"
      >
        <div className="mb-2 font-semibold">อีเมล</div>
        <a href="mailto:support@mederror.com" className="text-primary underline mb-4">support@mederror.com</a>
        <div className="mb-2 font-semibold">โทรศัพท์</div>
        <div className="text-muted-foreground mb-4">+66 1234 5678</div>
        <div className="mb-2 font-semibold">ที่อยู่</div>
        <div className="text-muted-foreground text-center">123 ถนนเมดเออเรอร์ เขตบางกอก กรุงเทพมหานคร</div>
      </motion.div>
    </section>
  );
} 
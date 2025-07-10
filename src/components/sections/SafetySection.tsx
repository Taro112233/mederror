"use client";
import { motion } from 'framer-motion';

export default function SafetySection() {
  return (
    <section className="w-full flex flex-col items-center py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        ความปลอดภัยและความน่าเชื่อถือ
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg text-muted-foreground max-w-2xl text-center"
      >
        ระบบของเราออกแบบโดยคำนึงถึงความปลอดภัยและความเป็นส่วนตัวของข้อมูล ช่วยให้องค์กรมั่นใจว่าข้อมูลจะถูกปกป้อง พร้อมส่งเสริมวัฒนธรรมการเรียนรู้และพัฒนาอย่างต่อเนื่อง
      </motion.p>
    </section>
  );
} 
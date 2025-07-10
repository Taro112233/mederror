"use client";

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section id="about" className="w-full flex flex-col items-center py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        เกี่ยวกับระบบ
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg text-muted-foreground max-w-2xl text-center"
      >
        ระบบรายงานความคลาดเคลื่อนทางยา มุ่งเน้นการสร้างวัฒนธรรมความปลอดภัยในองค์กรสาธารณสุข ช่วยให้บุคลากรสามารถรายงาน วิเคราะห์ และเรียนรู้จากข้อผิดพลาด เพื่อพัฒนาและป้องกันไม่ให้เกิดซ้ำ
      </motion.p>
    </section>
  );
} 
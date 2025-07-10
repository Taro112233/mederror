"use client";

import { motion } from 'framer-motion';

const stats = [
  { label: 'ผู้ใช้งาน', value: '2,500+' },
  { label: 'รายงานที่ส่ง', value: '10,000+' },
  { label: 'องค์กรที่ใช้งาน', value: '120+' },
  { label: 'ข้อเสนอแนะที่นำไปปรับปรุง', value: '500+' },
];

export default function StatsSection() {
  return (
    <section className="w-full flex flex-col items-center py-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-8 text-center"
      >
        สถิติการใช้งาน
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-2xl">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex flex-col items-center bg-card/70 rounded-lg p-6 shadow"
          >
            <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 
"use client";

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const stats = [
  { label: 'ผู้ใช้งาน', value: '2,500' },
  { label: 'รายงานที่ส่ง', value: '10,000' },
  { label: 'องค์กรที่ใช้งาน', value: '120' },
  { label: 'ข้อเสนอแนะที่นำไปปรับปรุง', value: '500' },
];

// AnimatedNumber: แสดงตัวเลขแบบ count up เฉพาะเมื่อ inView
function AnimatedNumber({ value, duration = 1.2 }: { value: string | number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!ref.current) return;
    const numberValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
    if (isNaN(numberValue)) {
      ref.current.textContent = String(value);
      return;
    }
    if (!isInView) {
      ref.current.textContent = '0';
      return;
    }
    const start = 0;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * (numberValue - start) + start);
      ref.current!.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ref.current!.textContent = numberValue.toLocaleString();
      }
    }
    requestAnimationFrame(animate);
  }, [value, duration, isInView]);
  return <span ref={ref} />;
}

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
            <div className="text-3xl font-bold text-primary mb-2">
              <AnimatedNumber value={stat.value} />
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 
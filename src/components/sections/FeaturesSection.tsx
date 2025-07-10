"use client";

import { motion } from 'framer-motion';

const features = [
  {
    icon: '📝',
    title: 'รายงานข้อผิดพลาด',
    description: 'แจ้งเหตุการณ์ความคลาดเคลื่อนทางยาได้ง่ายและรวดเร็ว'
  },
  {
    icon: '📊',
    title: 'Dashboard & วิเคราะห์',
    description: 'ดูสถิติ วิเคราะห์แนวโน้ม และระบุจุดเสี่ยงในองค์กร'
  },
  {
    icon: '🔒',
    title: 'ความปลอดภัยของข้อมูล',
    description: 'ข้อมูลถูกปกป้องด้วยมาตรฐานความปลอดภัยระดับองค์กร'
  },
  {
    icon: '🔔',
    title: 'การแจ้งเตือน',
    description: 'รับการแจ้งเตือนเมื่อเกิดเหตุการณ์สำคัญหรือมีการอัปเดต'
  },
  {
    icon: '👥',
    title: 'จัดการผู้ใช้และสิทธิ์',
    description: 'กำหนดสิทธิ์และจัดการผู้ใช้งานในระบบได้อย่างยืดหยุ่น'
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    description: 'สอบถามข้อมูลหรือขอคำแนะนำจาก AI ได้ตลอดเวลา'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full flex flex-col items-center py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-8 text-center"
      >
        ฟีเจอร์เด่นของระบบ
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex items-start gap-4 bg-card/70 rounded-lg p-6 shadow"
          >
            <span className="text-3xl">{feature.icon}</span>
            <div>
              <div className="font-semibold text-lg mb-1">{feature.title}</div>
              <div className="text-sm text-muted-foreground">{feature.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 
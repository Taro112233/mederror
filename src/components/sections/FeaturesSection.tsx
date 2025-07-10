"use client";

import { motion } from 'framer-motion';
import { FileText, BarChart3, Shield, Bell, Users, Bot, Database, Settings, Sparkles } from "lucide-react";

const features = [
  {
    icon: <FileText className="text-primary" size={32} />, // รายงานข้อผิดพลาด
    title: 'รายงานข้อผิดพลาด',
    description: 'แจ้งเหตุการณ์ความคลาดเคลื่อนทางยาได้ง่ายและรวดเร็ว'
  },
  {
    icon: <BarChart3 className="text-primary" size={32} />, // Dashboard & วิเคราะห์
    title: 'Dashboard & วิเคราะห์',
    description: 'ดูสถิติ วิเคราะห์แนวโน้ม และระบุจุดเสี่ยงในองค์กร'
  },
  {
    icon: <Users className="text-primary" size={32} />, // จัดการผู้ใช้และสิทธิ์
    title: 'จัดการผู้ใช้และสิทธิ์',
    description: 'กำหนดสิทธิ์และจัดการผู้ใช้งานในระบบได้อย่างยืดหยุ่น'
  },
  {
    icon: <Database className="text-primary" size={32} />, // จัดการฐานข้อมูล
    title: 'จัดการฐานข้อมูล',
    description: 'บริหารจัดการข้อมูลข้อผิดพลาดและผู้ใช้งานอย่างเป็นระบบ'
  },
  {
    icon: <Bot className="text-primary" size={32} />, // AI Assistant
    title: 'AI Assistant',
    description: 'สอบถามข้อมูลหรือขอคำแนะนำจาก AI ได้ตลอดเวลา'
  },
  {
    icon: <Shield className="text-primary" size={32} />, // ความปลอดภัยของข้อมูล
    title: 'ความปลอดภัยของข้อมูล',
    description: 'ข้อมูลถูกปกป้องด้วยมาตรฐานความปลอดภัยระดับองค์กร'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
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
"use client";

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="w-full flex flex-col items-center py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-4 text-center"
      >
        ติดต่อเรา
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-lg text-muted-foreground mb-8 max-w-xl text-center"
      >
        หากคุณมีคำถาม ข้อเสนอแนะ หรือปัญหาเกี่ยวกับการใช้งานระบบ ทีมงานของเรายินดีให้ความช่วยเหลือ
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-lg bg-card/80 rounded-xl p-8 shadow flex flex-col gap-6 items-center border border-border"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="bg-primary/10 rounded-full p-3">
            <Mail className="text-primary" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">อีเมล</span>
            <a href="mailto:thanatouchth@gmail.com" className="text-base font-medium text-primary underline">thanatouchth@gmail.com</a>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full">
          <div className="bg-primary/10 rounded-full p-3">
            <Phone className="text-primary" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">โทรศัพท์</span>
            <span className="text-base font-medium">+66 902637171</span>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full">
          <div className="bg-primary/10 rounded-full p-3">
            <MapPin className="text-primary" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">ที่อยู่</span>
            <span className="text-base font-medium">คณะเภสัชศาสตร์ มหาวิทยาลัยนเรศวร</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
} 
"use client";

import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'ข้อมูลของฉันปลอดภัยหรือไม่?',
    answer: 'ข้อมูลของคุณถูกเข้ารหัสและปกป้องด้วยมาตรฐานความปลอดภัยระดับองค์กร'
  },
  {
    question: 'ใครสามารถใช้งานระบบนี้ได้?',
    answer: 'บุคลากรทางการแพทย์และองค์กรที่ต้องการพัฒนาความปลอดภัยทางยา'
  },
  {
    question: 'ระบบมีค่าใช้จ่ายหรือไม่?',
    answer: 'มีแพ็กเกจสำหรับองค์กรทุกขนาด และสามารถติดต่อเพื่อขอทดลองใช้งานฟรี'
  },
  {
    question: 'ระบบแจ้งเตือนอย่างไร?',
    answer: 'ระบบจะส่งการแจ้งเตือนเมื่อเกิดเหตุการณ์สำคัญหรือมีการอัปเดตที่เกี่ยวข้อง'
  },
  {
    question: 'AI Assistant คืออะไร?',
    answer: 'AI Assistant ช่วยตอบคำถามและให้คำแนะนำเกี่ยวกับการใช้งานระบบและการจัดการความคลาดเคลื่อน'
  }
];

export default function FAQSection() {
  return (
    <section className="w-full flex flex-col items-center py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        คำถามที่พบบ่อย
      </motion.h2>
      <div className="w-full max-w-2xl space-y-6">
        {faqs.map((faq, idx) => (
          <motion.div
            key={faq.question}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-card/70 rounded-lg p-4 shadow"
          >
            <div className="font-semibold mb-2">{faq.question}</div>
            <div className="text-sm text-muted-foreground">{faq.answer}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 
"use client";
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full text-center py-4 text-xs text-muted-foreground"
    >
      © {new Date().getFullYear()} MedError. All rights reserved.
    </motion.footer>
  );
} 
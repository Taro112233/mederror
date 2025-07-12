import { motion } from 'framer-motion';

export default function GlobeLogo({ className = "" }: { className?: string }) {
  // ตำแหน่งจุด radar (x, y) เป็นเปอร์เซ็นต์ของขนาด SVG
  const radarPoints = [
    { x: 70, y: 30, delay: 0 },
    { x: 40, y: 60, delay: 0.5 },
    { x: 60, y: 80, delay: 1 },
  ];

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, 10, 0, 10, 0],
        rotate: [0, 360],
      }}
      transition={{
        opacity: { duration: 0.7 },
        scale: { duration: 0.7 },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
      }}
      style={{ width: 120, height: 120 }}
    >
      <svg width={120} height={120} viewBox="0 0 120 120" fill="none">
        {/* วาด globe (วงกลมหลัก) */}
        <circle cx="60" cy="60" r="50" stroke="#3b82f6" strokeWidth="4" fill="#e0f2fe" />
        {/* วาดเส้นลองจิจูด */}
        <ellipse cx="60" cy="60" rx="50" ry="20" stroke="#60a5fa" strokeWidth="2" fill="none" />
        <ellipse cx="60" cy="60" rx="50" ry="40" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
        {/* วาดเส้นละติจูด */}
        <ellipse cx="60" cy="60" rx="20" ry="50" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
        <ellipse cx="60" cy="60" rx="40" ry="50" stroke="#60a5fa" strokeWidth="1" fill="none" />
        {/* จุด radar */}
        {radarPoints.map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={6}
            fill="#ef4444"
            initial={{ opacity: 0.2, scale: 0.7 }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: pt.delay }}
          />
        ))}
      </svg>
    </motion.div>
  );
} 
'use client';

import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassCardDark({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

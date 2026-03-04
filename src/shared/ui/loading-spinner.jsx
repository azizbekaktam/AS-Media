'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex-center flex-col gap-4">
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20"></div>
        {/* Inner spinning ring */}
        <div className="absolute inset-1 rounded-full border-2 border-yellow-400 border-t-transparent border-r-transparent"></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        </div>
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-white/80 ${textSizes[size]} text-center max-w-xs`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: 'normal' | 'lg';
  /** Hover lift + glow (default true) */
  hover?: boolean;
};

export function PremiumCard({
  children,
  className = '',
  padding = 'normal',
  hover = true,
}: PremiumCardProps) {
  const innerClass = padding === 'lg' ? 'card-premium-inner card-premium-padding-lg' : 'card-premium-inner';
  return (
    <motion.div
      className={`card-premium ${className}`}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className={innerClass}>{children}</div>
    </motion.div>
  );
}

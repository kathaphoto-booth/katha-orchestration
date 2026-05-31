'use client';

import React from 'react';
import { motion } from 'motion/react';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
  id?: string;
}

export function FadeIn({ children, duration = 1.0, delay = 0, className, id }: FadeInProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
      transition={{ duration, ease: [0.215, 0.61, 0.355, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

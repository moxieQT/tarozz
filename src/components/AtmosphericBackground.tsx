import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Blob {
  className: string;
  color: 'accent' | 'ink';
  opacity: number;
  frames: string[];
  duration: number;
  delay?: number;
}

const VARIANTS: Record<1 | 2, Blob[]> = {
  1: [
    {
      className: 'absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full',
      color: 'accent',
      opacity: 0.15,
      frames: ['translate(0%, 0%) scale(1)', 'translate(5%, 10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
      duration: 15,
    },
    {
      className: 'absolute top-[40%] right-[-20%] w-[70vw] h-[70vw] rounded-full',
      color: 'ink',
      opacity: 0.05,
      frames: ['translate(0%, 0%) scale(1)', 'translate(-5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
      duration: 20,
      delay: 2,
    },
  ],
  2: [
    {
      className: 'absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full',
      color: 'accent',
      opacity: 0.15,
      frames: ['translate(0%, 0%) scale(1)', 'translate(-5%, 10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
      duration: 18,
    },
    {
      className: 'absolute bottom-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full',
      color: 'ink',
      opacity: 0.05,
      frames: ['translate(0%, 0%) scale(1)', 'translate(5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
      duration: 22,
      delay: 2,
    },
  ],
};

interface AtmosphericBackgroundProps {
  variant?: 1 | 2;
}

/**
 * The "breathing" gradient background shared across screens. Honors
 * `prefers-reduced-motion` by rendering the gradients statically, and avoids
 * duplicating the same markup in every screen.
 */
export function AtmosphericBackground({ variant = 1 }: AtmosphericBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const blobs = VARIANTS[variant];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={blob.className}
          style={{
            background: `radial-gradient(circle, var(--${blob.color}) 0%, transparent 70%)`,
            opacity: blob.opacity,
          }}
          animate={reduceMotion ? undefined : { transform: blob.frames }}
          transition={
            reduceMotion
              ? undefined
              : { duration: blob.duration, repeat: Infinity, ease: 'easeInOut', delay: blob.delay }
          }
        />
      ))}
    </div>
  );
}

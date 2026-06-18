import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MyelinSegmentToastProps {
  intensity: number; // 0-100
  onComplete?: () => void;
  insightText?: string;
  isVisible: boolean;
}

// Ramanujan approximation of ellipse circumference
function ellipseCircumference(rx: number, ry: number): number {
  const h = ((rx - ry) / (rx + ry)) ** 2;
  return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

export function MyelinSegmentToast({ intensity, onComplete, insightText, isVisible }: MyelinSegmentToastProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    if (!isVisible) { setPhase('entering'); return; }

    setPhase('entering');
    // 300ms enter + 1800ms visible = 2100ms → start exit
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
      // 400ms exit → call onComplete
      const doneTimer = setTimeout(() => onComplete?.(), 400);
      return () => clearTimeout(doneTimer);
    }, 2100);

    return () => clearTimeout(exitTimer);
  }, [isVisible, onComplete]);

  const segRx = Math.max(3, Math.min(7, (intensity / 100) * 7));
  const segRy = 4;
  const segOpacity = Math.max(0.4, Math.min(1.0, intensity / 100));
  const circ = ellipseCircumference(segRx, segRy);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{
            enter: { duration: 0.3, ease: 'easeOut' },
            exit: { duration: 0.4, ease: 'easeIn' },
            default: { duration: 0.3 },
          }}
          className="fixed z-50 bottom-[88px] right-5"
          style={{ width: 180, height: 44 }}
        >
          <div
            className="w-full h-full flex items-center gap-3 px-3 rounded-xl backdrop-blur-md"
            style={{
              background: 'rgba(5,8,16,0.92)',
              border: '1px solid rgba(255,250,240,0.15)',
              borderRadius: 12,
            }}
          >
            {/* Mini axon + segment animation */}
            <svg width="44" height="16" overflow="visible">
              {/* Bare axon line */}
              <line x1="2" y1="8" x2="42" y2="8" stroke="rgba(255,250,240,0.25)" strokeWidth="1" />

              {/* Axon center point for segment */}
              <g transform="translate(22, 8)">
                {/* Segment outline — draws in via stroke-dashoffset (wrapping effect) */}
                <motion.ellipse
                  cx={0}
                  cy={0}
                  rx={segRx}
                  ry={segRy}
                  fill="none"
                  stroke={`rgba(255,250,235,${segOpacity})`}
                  strokeWidth="1"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: 0 }}
                  exit={{ strokeDashoffset: circ }}
                  transition={{ duration: 0.55, ease: 'easeInOut', delay: 0.1 }}
                />
                {/* Segment fill — fades in after outline draws */}
                <motion.ellipse
                  cx={0}
                  cy={0}
                  rx={segRx}
                  ry={segRy}
                  fill={`rgba(255,250,235,${segOpacity * 0.85})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                />
              </g>
            </svg>

            {/* Labels */}
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-mono text-[9px] text-[rgba(255,255,255,0.4)] tracking-wider uppercase">
                сегмент
              </span>
              <span className="font-mono text-[11px] text-white font-medium">
                {intensity}%
              </span>
              {insightText && (
                <span className="font-mono text-[8px] text-[rgba(255,250,240,0.5)] leading-tight mt-0.5 max-w-[90px]">
                  {insightText}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MyelinSegmentToast;

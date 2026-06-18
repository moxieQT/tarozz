import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AxonProgress } from './AxonProgress';

interface CycleCompleteScreenProps {
  cycleNumber: number;
  totalSegments: number;
  daysElapsed: number;
  previousCycles: number;
  onContinue: () => void;
  scientificFact?: string;
}

export function CycleCompleteScreen({
  cycleNumber,
  totalSegments,
  daysElapsed,
  previousCycles,
  onContinue,
  scientificFact,
}: CycleCompleteScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(1);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    const t1 = setTimeout(() => { setPhase(2); }, 1500);
    const t2 = setTimeout(() => { setPhase(3); }, 3500);
    const t3 = setTimeout(() => setPhase(4), 5000);
    timerRefs.current = [t1, t2, t3];

    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 500);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#020408] z-[100] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 0.5 : 0.8 }}
    >
      <div ref={containerRef} className="w-full max-w-md px-6 flex flex-col items-center gap-6">

        {/* Phase 1 label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase <= 3 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[10px] text-[rgba(150,220,185,0.7)] uppercase tracking-widest text-center"
        >
          ЦИКЛ {cycleNumber} · {totalSegments} СЕГМЕНТОВ · {daysElapsed} ДНЕЙ
        </motion.div>

        {/* Axon visualization area */}
        <div className="w-full flex flex-col gap-3 items-center">

          {/* Current cycle axon in full 3D interactive WebGL */}
          <motion.div
            className="w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <AxonProgress
              totalSegments={totalSegments}
              completedSegments={totalSegments}
              justAddedSegments={0}
              cycleNumber={cycleNumber}
              intensity={100}
            />
          </motion.div>

          {/* Phase 3: previous cycle bundle tract info label */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                className="w-full flex flex-col items-center gap-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-mono text-[10px] text-[#63E0A0] uppercase tracking-[0.2em] text-center mt-3 bg-emerald-950/30 px-5 py-2.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(99,224,160,0.15)]"
                >
                  ТРАКТ БЕЛОГО ВЕЩЕСТВА · {cycleNumber} {cycleNumber === 1 ? 'АКСОН' : cycleNumber < 5 ? 'АКСОНА' : 'АКСОНОВ'} В СВЯЗКЕ
                </motion.div>
                
                {previousCycles > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.8 }}
                    className="font-mono text-[8px] text-[rgba(150,220,185,0.6)] uppercase tracking-wider text-center"
                  >
                    + {previousCycles} предыдущих сформированных проводящих путей
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phase 4: scientific fact + continue */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              className="flex flex-col items-center text-center gap-4 mt-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="font-mono text-[10px] text-[rgba(150,220,185,0.55)] uppercase tracking-widest">
                ЧТО ПРОИЗОШЛО
              </div>
              <p className="text-[14px] leading-[1.7] text-[rgba(240,250,245,0.85)] max-w-[320px]">
                {scientificFact ?? 'Генерация данных о структурных изменениях…'}
              </p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                onClick={handleContinue}
                className="mt-4 px-8 py-3 rounded-full border border-emerald-500/20 bg-emerald-950/20 backdrop-blur text-[#63E0A0] font-mono text-[11px] uppercase tracking-wider hover:bg-emerald-500/10 transition-all duration-300 active:scale-95"
              >
                Продолжить
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CycleCompleteScreen;

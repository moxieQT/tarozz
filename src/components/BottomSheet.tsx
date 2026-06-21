import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardType } from '../types';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardType | null;
  onSave: (intensity: number) => void;
}

const INTENSITY_LABELS: [number, string][] = [
  [0, 'Не узнаю'],
  [25, 'Немного'],
  [50, 'Узнаю'],
  [75, 'Сильно'],
  [100, 'Полностью'],
];

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  card,
  onSave,
}) => {
  const [intensity, setIntensity] = useState(50);

  useEffect(() => {
    if (isOpen) setIntensity(50);
  }, [isOpen, card]);

  const currentLabel = INTENSITY_LABELS.reduce((prev, curr) =>
    Math.abs(curr[0] - intensity) < Math.abs(prev[0] - intensity) ? curr : prev
  )[1];

  return (
    <AnimatePresence>
      {isOpen && card && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 backdrop-blur-md"
            style={{ background: 'var(--scrim)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full max-w-[420px] mx-auto rounded-t-[32px] p-6 pt-8 z-50 backdrop-blur-3xl overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.2)]"
            style={{
              background: 'var(--glass-2)',
              borderTop: '1px solid var(--glass-border)',
              borderLeft: '1px solid var(--glass-border)',
              borderRight: '1px solid var(--glass-border)'
            }}
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />

            {/* Handle */}
            <div className="flex flex-col items-center mb-8 relative z-10 w-full">
              <div className="w-12 h-[3px] rounded-full mb-6" style={{ background: 'var(--glass-border-2)' }} />
              <div className="flex justify-between items-center w-full">
                <h3 className="text-3xl font-serif italic" style={{ color: 'var(--ink)' }}>
                  Оцените состояние
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="p-3 -mr-2 rounded-full transition-all hover:bg-[rgba(255,255,255,0.1)] backdrop-blur-md"
                  style={{ color: 'var(--ink)', border: '1px solid var(--glass-border)' }}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Card name + question */}
            <div className="mb-8 relative z-10 p-5 rounded-[20px]" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}>
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold mb-3"
                style={{ color: 'var(--ink3)' }}
              >
                Узнаваемость
              </p>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--ink)' }}>
                Насколько <span className="font-serif italic font-bold">«{card.title}»</span> перекликается с вашим текущим опытом?
              </p>
            </div>

            {/* Slider */}
            <div className="mb-10 pb-4 relative z-10 px-1">
              <div className="flex justify-between items-center mb-6" style={{ color: 'var(--ink)' }}>
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold">Уровень</span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold" style={{ color: 'var(--accent)' }}>
                    {currentLabel}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--ink3)' }}>
                    {intensity}%
                  </span>
                </div>
              </div>

              <div className="relative h-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  aria-label="Уровень узнаваемости"
                  aria-valuetext={`${currentLabel}, ${intensity}%`}
                  className="w-full h-[3px] appearance-none cursor-pointer outline-none z-10 rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--accent) ${intensity}%, rgba(255,255,255,0.1) ${intensity}%)`,
                  }}
                />
              </div>

              {/* Scale labels */}
              <div className="flex justify-between mt-3 px-0.5">
                {INTENSITY_LABELS.map(([val, label]) => (
                  <span
                    key={val}
                    className="text-[9px] font-mono"
                    style={{
                      color: Math.abs(val - intensity) < 13 ? 'var(--accent)' : 'var(--ink3)',
                      fontWeight: Math.abs(val - intensity) < 13 ? 700 : 400,
                      transition: 'color 0.2s, font-weight 0.2s',
                    }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSave(intensity)}
              className="w-full py-5 rounded-[16px] text-[12px] font-bold uppercase tracking-[0.15em] active:scale-[0.98] transition-all relative overflow-hidden group z-10"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                boxShadow: '0 12px 30px -10px var(--accent), inset 0 1px 2px rgba(255,255,255,0.4)',
              }}
            >
              <span className="relative z-10">Добавить в колоду</span>
              <div className={`absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out`} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

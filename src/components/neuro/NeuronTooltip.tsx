import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Zap, Clock, Brain } from 'lucide-react';

export interface NeuronTooltipData {
  bornAt: string;
  phaseName: string;
  days: number;
  intensity?: number;
  maturityStage: string;
  synapticConnections?: number;
}

interface NeuronTooltipProps {
  data: NeuronTooltipData;
  isVisible: boolean;
  x?: number;
  y?: number;
}

export function NeuronTooltip({ data, isVisible, x = 0, y = 0 }: NeuronTooltipProps) {
  const bornDate = new Date(data.bornAt);
  const dateStr = bornDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[1000] pointer-events-none"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="px-4 py-3 rounded-lg backdrop-blur-xl space-y-2 shadow-lg min-w-[240px]"
            style={{
              background: 'var(--glass-2)',
              border: '1px solid var(--glass-border)',
              color: 'var(--ink)',
            }}
          >
            {/* Title */}
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <Brain size={14} style={{ color: 'var(--accent)' }} />
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                Нейрон
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar size={12} style={{ color: 'var(--ink3)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                Рожден: <span style={{ color: 'var(--accent)' }}>{dateStr}</span>
              </span>
            </div>

            {/* Phase */}
            <div className="flex items-center gap-2">
              <Zap size={12} style={{ color: 'var(--ink3)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                Фаза: <span style={{ color: 'var(--accent)' }}>{data.phaseName}</span>
              </span>
            </div>

            {/* Age */}
            <div className="flex items-center gap-2">
              <Clock size={12} style={{ color: 'var(--ink3)' }} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                Возраст: <span style={{ color: 'var(--accent)' }}>{Math.round(data.days)} дн.</span>
              </span>
            </div>

            {/* Maturity stage */}
            <div className="pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
              <span className="font-mono text-[8px]" style={{ color: 'var(--ink3)' }}>
                Стадия развития
              </span>
              <div className="text-[11px] font-serif italic mt-1" style={{ color: 'var(--accent)' }}>
                {data.maturityStage}
              </div>
            </div>

            {/* Intensity */}
            {data.intensity !== undefined && (
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-[8px]" style={{ color: 'var(--ink3)' }}>
                  Интенсивность:
                </span>
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--sunken)' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${data.intensity}%`,
                      background: `hsl(${Math.round(data.intensity * 1.2)}, 100%, 50%)`,
                    }}
                  />
                </div>
                <span className="font-mono text-[8px]" style={{ color: 'var(--accent)' }}>
                  {data.intensity}%
                </span>
              </div>
            )}

            {/* Synaptic connections */}
            {data.synapticConnections !== undefined && (
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-[8px]" style={{ color: 'var(--ink3)' }}>
                  Синапсы: <span style={{ color: 'var(--accent)' }}>{data.synapticConnections}</span>
                </span>
              </div>
            )}

            {/* Arrow pointer */}
            <div
              className="absolute w-2 h-2"
              style={{
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                background: 'var(--glass-2)',
                border: '1px solid var(--glass-border)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NeuronTooltip;

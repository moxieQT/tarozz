import React from 'react';
import { Activity, Zap, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export interface NeuronStatsData {
  total: number;
  active: number;
  integrated: number;
  dormant: number;
  avgAge: number; // в днях
}

interface NeuronStatsProps {
  data: NeuronStatsData;
}

export function NeuronStats({ data }: NeuronStatsProps) {
  const activePercent = data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;
  const integratedPercent = data.total > 0 ? Math.round((data.integrated / data.total) * 100) : 0;
  const dormantPercent = data.total > 0 ? Math.round((data.dormant / data.total) * 100) : 0;

  return (
    <div
      className="w-full px-6 py-4 rounded-lg backdrop-blur-md"
      role="region"
      aria-label="Neurogenesis statistics"
      style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <h3 className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>
            Статус нейрогенеза
          </h3>
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          {/* Active neurons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={12} style={{ color: '#10b981' }} aria-hidden="true" />
                <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                  Активные
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold" style={{ color: '#10b981' }} aria-label={`Active neurons: ${data.active} out of ${data.total}`}>
                {data.active}/{data.total}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--sunken)' }}
              role="progressbar"
              aria-valuenow={activePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Active neurons progress"
            >
              <motion.div
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${activePercent}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: 'linear-gradient(90deg, #10b981, #22c55e)',
                }}
              />
            </div>
          </div>

          {/* Integrated neurons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={12} style={{ color: '#06b6d4' }} aria-hidden="true" />
                <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                  Интегрированные
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold" style={{ color: '#06b6d4' }} aria-label={`Integrated neurons: ${data.integrated} out of ${data.total}`}>
                {data.integrated}/{data.total}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--sunken)' }}
              role="progressbar"
              aria-valuenow={integratedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Integrated neurons progress"
            >
              <motion.div
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${integratedPercent}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                style={{
                  background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
                }}
              />
            </div>
          </div>

          {/* Dormant neurons */}
          {data.dormant > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={12} style={{ color: 'var(--ink3)' }} aria-hidden="true" />
                  <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                    Спящие
                  </span>
                </div>
                <span className="font-mono text-[9px] font-bold" style={{ color: 'var(--ink3)' }} aria-label={`Dormant neurons: ${data.dormant} out of ${data.total}`}>
                  {data.dormant}/{data.total}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--sunken)' }}
                role="progressbar"
                aria-valuenow={dormantPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Dormant neurons progress"
              >
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${dormantPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  style={{
                    background: 'rgba(100,116,139,0.4)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Average age */}
        {data.avgAge > 0 && (
          <div
            className="pt-2 border-t"
            style={{ borderColor: 'var(--glass-border)' }}
            aria-label={`Average neuron age: ${Math.round(data.avgAge)} days`}
          >
            <span className="font-mono text-[8px]" style={{ color: 'var(--ink3)' }}>
              Средний возраст: <span style={{ color: 'var(--accent)' }}>{Math.round(data.avgAge)} дн.</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default NeuronStats;

import React from 'react';
import { Activity, Zap, Brain } from 'lucide-react';

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
    <div className="w-full px-6 py-4 rounded-lg backdrop-blur-md" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>
            Статус нейрогенеза
          </span>
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          {/* Active neurons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={12} style={{ color: '#10b981' }} />
                <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                  Активные
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold" style={{ color: '#10b981' }}>
                {data.active}/{data.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--sunken)' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${activePercent}%`,
                  background: 'linear-gradient(90deg, #10b981, #22c55e)',
                }}
              />
            </div>
          </div>

          {/* Integrated neurons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={12} style={{ color: '#06b6d4' }} />
                <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                  Интегрированные
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold" style={{ color: '#06b6d4' }}>
                {data.integrated}/{data.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--sunken)' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${integratedPercent}%`,
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
                  <Brain size={12} style={{ color: 'var(--ink3)' }} />
                  <span className="font-mono text-[9px]" style={{ color: 'var(--ink2)' }}>
                    Спящие
                  </span>
                </div>
                <span className="font-mono text-[9px] font-bold" style={{ color: 'var(--ink3)' }}>
                  {data.dormant}/{data.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--sunken)' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${dormantPercent}%`,
                    background: 'rgba(100,116,139,0.4)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Average age */}
        {data.avgAge > 0 && (
          <div className="pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
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

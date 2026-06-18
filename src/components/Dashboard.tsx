import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, CheckCircle, ArrowLeft, ArrowRight, ChevronDown,
  Map, Compass, Layers, Heart, Shield, Zap, Brain, RefreshCw, FileText,
  Clock, Eye
} from 'lucide-react';
import { useAppStore } from '../store';
import { PHASES, PATHS } from '../data/phases';
import { useNavigate } from 'react-router-dom';
import { AxonProgress } from './neuro';

const PHASE_META: Record<number, { icon: React.ReactNode; accent: string; accentSoft: string; estimate: string; screenType: string }> = {
  0: { icon: <Map size={20} />, accent: '#3B7A57', accentSoft: 'rgba(59,122,87,0.12)', estimate: '15–20 мин', screenType: 'Картография' },
  1: { icon: <Brain size={20} />, accent: '#6B5B95', accentSoft: 'rgba(107,91,149,0.12)', estimate: '10–15 мин', screenType: 'Гейткипер' },
  2: { icon: <Layers size={20} />, accent: '#8B6914', accentSoft: 'rgba(139,105,20,0.12)', estimate: '15–20 мин', screenType: 'Гейткипер' },
  3: { icon: <Heart size={20} />, accent: '#C0392B', accentSoft: 'rgba(192,57,43,0.12)', estimate: '20–30 мин', screenType: 'Гейткипер' },
  4: { icon: <RefreshCw size={20} />, accent: '#8E6F3E', accentSoft: 'rgba(142,111,62,0.12)', estimate: '10–15 мин', screenType: 'Антипод' },
  5: { icon: <Zap size={20} />, accent: '#2E7D4F', accentSoft: 'rgba(46,125,79,0.12)', estimate: '15–20 мин', screenType: 'Интервенция' },
  6: { icon: <Compass size={20} />, accent: '#2980B9', accentSoft: 'rgba(41,128,185,0.12)', estimate: '15 мин', screenType: 'Гейткипер' },
  7: { icon: <FileText size={20} />, accent: '#5B6E7A', accentSoft: 'rgba(91,110,122,0.12)', estimate: '20–30 мин', screenType: 'Перенос' },
  8: { icon: <Shield size={20} />, accent: '#1A3628', accentSoft: 'rgba(26,54,40,0.12)', estimate: '10 мин', screenType: 'Рецидив-план' },
};

function ProgressRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        strokeDasharray={circ}
      />
    </svg>
  );
}

export function Dashboard() {
  const { activePathId, activePathPhases, highestUnlockedIndex, setCurrentPhaseIndex, resetAll, answers, completedCycles } = useAppStore();
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const pathConfig = PATHS.find(p => p.id === activePathId)
    || PATHS.find(p => p.subPaths?.find(s => s.id === activePathId))?.subPaths?.find(s => s.id === activePathId);

  const total = activePathPhases.length;
  const completedCount = highestUnlockedIndex;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handlePhaseClick = (index: number) => {
    if (index <= highestUnlockedIndex) {
      setCurrentPhaseIndex(index);
      const phaseId = activePathPhases[index];
      if (phaseId === 0) navigate('/cartography');
      else if (phaseId === 4) navigate('/antipode');
      else if (phaseId === 5) navigate('/intervention');
      else if (phaseId === 7) navigate('/transfer');
      else navigate('/gatekeeper');
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="min-h-screen relative font-sans" style={{ backgroundColor: 'var(--surface)' }}>
      {/* 
        GLASSMORPHISM 3.0 - LAYER 1: Breathing Atmospheric Background
      */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(5%, 10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen"
          style={{ background: 'var(--accent)', opacity: 0.15, filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(-5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[-20%] w-[70vw] h-[70vw] rounded-full mix-blend-screen"
          style={{ background: 'var(--ink)', opacity: 0.05, filter: 'blur(100px)' }}
        />
      </div>

      {/* Sticky header */}
      <div
        className="sticky top-0 z-40 backdrop-blur-2xl"
        style={{ background: 'var(--glass-1)', borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              resetAll();
              navigate('/');
            }}
            className="p-2.5 rounded-full transition-colors shrink-0"
            style={{ color: 'var(--ink2)', background: 'var(--sunken)' }}
            title="Сменить режим"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate" style={{ color: 'var(--ink)' }}>
              {pathConfig?.title || 'Карта пути'}
            </h1>
            <p className="text-[11px] font-mono uppercase tracking-[0.12em] mt-0.5" style={{ color: 'var(--ink3)' }}>
              {completedCount} из {total} этапов
            </p>
          </div>

          <div className="relative shrink-0 flex items-center justify-center">
            <ProgressRing pct={pct} size={48} />
            <span
              className="absolute text-[11px] font-mono font-bold"
              style={{ color: 'var(--accent-ink)' }}
            >
              {pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Journey */}
      <div className="max-w-2xl mx-auto px-6 pt-6 pb-32 relative">
        <div className="mb-8 relative z-20">
          <AxonProgress
            totalSegments={total}
            completedSegments={highestUnlockedIndex}
            justAddedSegments={0}
            cycleNumber={completedCycles.length + 1}
            intensity={50}
          />
        </div>

        {/* Vertical connector */}
        <div
          className="absolute left-[39px] top-[148px] w-0.5"
          style={{
            background: `linear-gradient(to bottom, var(--border), rgba(120,154,132,0.15), transparent)`,
            height: 'calc(100% - 15rem)',
          }}
        />

        <div className="flex flex-col gap-3 relative z-10">
          {activePathPhases.map((phaseId, index) => {
            const phase = PHASES.find(p => p.id === phaseId);
            if (!phase) return null;

            const meta = PHASE_META[phaseId] || PHASE_META[0];
            const isUnlocked = index <= highestUnlockedIndex;
            const isCompleted = index < highestUnlockedIndex;
            const isCurrent = index === highestUnlockedIndex;
            const isExpanded = expandedIndex === index;
            const phaseAnswers = answers[phaseId];

            const isDimmed = expandedIndex !== null && expandedIndex !== index;

            return (
              <motion.div
                key={`${phaseId}-${index}`}
                ref={isCurrent ? activeRef : undefined}
                initial={{ opacity: 0, y: 24 }}
                animate={{ 
                  opacity: isDimmed ? 0.4 : 1, 
                  y: 0,
                  scale: isDimmed ? 0.96 : 1,
                  filter: isDimmed ? 'blur(4px)' : 'blur(0px)',
                  zIndex: isExpanded ? 50 : 1
                }}
                transition={{ delay: index * 0.08, duration: 0.5, type: 'spring', stiffness: 400, damping: 35 }}
                className="relative cursor-pointer group"
              >
                {/* 
                  GLASSMORPHISM 3.0 - LAYER 2: Reactive Under-Glow
                */}
                <motion.div
                  className="absolute -inset-1 rounded-[24px] z-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isExpanded || isCurrent ? 0.3 : 0,
                    scale: isExpanded || isCurrent ? 1 : 0.95
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ 
                    background: `radial-gradient(circle at 50% 50%, ${meta.accent}, transparent 70%)`,
                    filter: 'blur(20px)'
                  }}
                />

                <div 
                  className={`relative z-10 rounded-[24px] overflow-hidden backdrop-blur-2xl transition-all duration-500`}
                  style={{
                    backgroundColor: isCurrent ? 'var(--glass-2)' : isCompleted ? 'var(--glass-1)' : 'var(--glass-1)',
                    border: isCurrent ? '1px solid var(--glass-border-2)' : isCompleted ? '1px solid var(--glass-border)' : '1px solid var(--glass-border)',
                    boxShadow: isCurrent || isExpanded 
                      ? '0 20px 40px -10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.1)' 
                      : '0 5px 15px -5px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Main row */}
                  <button
                    onClick={() => isUnlocked ? toggleExpand(index) : undefined}
                    disabled={!isUnlocked}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    {/* Phase node */}
                    <div className="relative shrink-0">
                      <div
                        className="w-[56px] h-[56px] rounded-[18px] flex items-center justify-center transition-all duration-500 shadow-inner"
                        style={
                          isCompleted
                            ? { background: 'var(--glass-1)', color: meta.accent, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)' }
                            : isCurrent
                            ? { background: meta.accent, color: '#fff', boxShadow: '0 10px 20px -5px var(--accent), inset 0 1px 2px rgba(255,255,255,0.4)' }
                            : { background: 'rgba(0,0,0,0.1)', color: 'var(--ink3)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)' }
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle size={22} />
                        ) : isUnlocked ? (
                          meta.icon
                        ) : (
                          <Lock size={18} />
                        )}
                      </div>
                      {isCurrent && (
                        <motion.div
                          className="absolute -inset-1 rounded-[20px]"
                          style={{ border: `2px solid ${meta.accent}` }}
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-mono uppercase tracking-[0.16em]"
                          style={{ color: isCurrent ? meta.accent : 'var(--ink3)' }}
                        >
                          {phase.title}
                        </span>
                        {isCurrent && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
                            style={{ background: meta.accent }}
                          >
                            Сейчас
                          </span>
                        )}
                        {isCompleted && (
                          <span
                            className="text-[9px] font-mono uppercase tracking-wider"
                            style={{ color: meta.accent }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-[17px] font-bold leading-tight truncate"
                        style={{ color: isUnlocked ? 'var(--ink)' : 'var(--ink3)' }}
                      >
                        {phase.subtitle}
                      </h3>
                      <p
                        className="text-[12px] mt-0.5 line-clamp-1"
                        style={{ color: 'var(--ink3)' }}
                      >
                        {phase.description}
                      </p>
                    </div>

                    {/* Expand chevron */}
                    {isUnlocked && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                        style={{ color: 'var(--ink3)' }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    )}
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && isUnlocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1">
                          <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

                          {/* Meta pills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider"
                              style={{ background: 'var(--sunken)', color: 'var(--ink2)', border: '1px solid var(--border)' }}
                            >
                              <Clock size={11} />
                              {meta.estimate}
                            </div>
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider"
                              style={{ background: meta.accentSoft, color: meta.accent }}
                            >
                              <Eye size={11} />
                              {meta.screenType}
                            </div>
                          </div>

                          {/* Completed answers preview */}
                          {isCompleted && phaseAnswers && Object.keys(phaseAnswers).length > 0 && (
                            <div
                              className="rounded-xl p-3.5 mb-4"
                              style={{ background: 'var(--sunken)', border: '1px solid var(--border)' }}
                            >
                              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink3)' }}>
                                Ваши ответы
                              </p>
                              {Object.entries(phaseAnswers).map(([key, val]) => (
                                <p key={key} className="text-[13px] font-serif italic leading-relaxed" style={{ color: 'var(--ink2)' }}>
                                  «{val}»
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Readiness markers preview */}
                          {!isCompleted && phase.readinessMarkers.length > 0 && (
                            <div className="mb-4">
                              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink3)' }}>
                                Маркеры готовности: {phase.readinessMarkers.length}
                              </p>
                              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink2)' }}>
                                {phase.readinessMarkers[0]?.text}
                                {phase.readinessMarkers.length > 1 && ` (+${phase.readinessMarkers.length - 1})`}
                              </p>
                            </div>
                          )}

                          {/* Enter button */}
                          <button
                            onClick={() => handlePhaseClick(index)}
                            className="w-full py-4 mt-2 rounded-[16px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden group"
                            style={{ 
                              background: isCurrent || isCompleted ? meta.accent : 'var(--glass-1)', 
                              color: isCurrent || isCompleted ? '#fff' : 'var(--ink)', 
                              boxShadow: isCurrent || isCompleted ? `0 12px 30px -10px ${meta.accent}, inset 0 1px 2px rgba(255,255,255,0.4)` : 'inset 0 1px 2px rgba(255,255,255,0.1)',
                              border: isCurrent || isCompleted ? 'none' : '1px solid var(--glass-border)'
                            }}
                          >
                            <span className="text-[12px] font-bold uppercase tracking-[0.15em] relative z-10">{isCompleted ? 'Пересмотреть' : 'Войти в фазу'}</span>
                            <ArrowRight size={18} className="relative z-10" />
                            
                            {/* Button Highlight reflection */}
                            <div className={`absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] ${(isCurrent || isCompleted) && 'group-hover:left-[200%]'} transition-all duration-1000 ease-in-out`} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Journey end marker */}
        <motion.div
          className="flex flex-col items-center mt-8 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--sunken)', border: '1px solid var(--border)' }}
          >
            <Shield size={16} style={{ color: 'var(--ink3)' }} />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest mt-3" style={{ color: 'var(--ink3)' }}>
            План безопасности
          </p>
        </motion.div>
      </div>
    </div>
  );
}

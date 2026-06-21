import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PATHS } from '../data/phases';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Shield, AlertCircle, Activity, ArrowRight, ArrowUpRight, Lock, Crown } from 'lucide-react';
import { canAccessMode } from '../data/subscription';
import { AtmosphericBackground } from './AtmosphericBackground';

const ICONS: Record<string, React.ReactNode> = {
  solo: <Sparkles className="w-6 h-6" />,
  therapeutic: <BookOpen className="w-6 h-6" />,
  full: <Shield className="w-6 h-6" />,
  crisis: <AlertCircle className="w-6 h-6" />,
  cbt: <BookOpen className="w-5 h-5" />,
  schema: <Activity className="w-5 h-5" />,
};

export function ModeSelection() {
  const { setPath, subscription, openPaywall, recordActivity } = useAppStore();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAnyExpanded = expandedId !== null;

  const handleStartPath = (e: React.MouseEvent, pathId: string, phases: number[]) => {
    e.stopPropagation();
    if (!canAccessMode(subscription, pathId)) {
      openPaywall('mode_locked');
      return;
    }
    setPath(pathId, phases);
    recordActivity();
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen relative flex flex-col overflow-x-hidden font-sans"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <AtmosphericBackground variant={1} />

      <div className="flex-1 w-full px-6 pt-16 pb-24 relative z-10 flex flex-col max-w-2xl mx-auto">
        
        {/* Editorial Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 mt-4"
        >
          <div className="flex items-center gap-3 mb-4 opacity-70">
            <div className="h-[1px] w-8" style={{ background: 'var(--ink)' }} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold" style={{ color: 'var(--ink)' }}>
              Среда погружения
            </span>
          </div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-[1.05]" style={{ color: 'var(--ink)' }}>
            Выберите<br />маршрут
          </h1>
        </motion.header>

        {/* Spatial List */}
        <div className="flex flex-col gap-6 relative">
          {PATHS.map((path, idx) => {
            const isExpanded = expandedId === path.id;
            const isDimmed = isAnyExpanded && !isExpanded;
            const isLocked = !canAccessMode(subscription, path.id);
            
            const [overline, ...rest] = path.title.split('—');
            const mainTitle = rest.join('—').trim() || overline.trim();

            return (
              <motion.div
                layout
                key={path.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: isDimmed ? 0.4 : 1, 
                  y: 0,
                  scale: isDimmed ? 0.96 : 1, // Создаем оптическую глубину для неактивных карточек
                  filter: isDimmed ? 'blur(4px)' : 'blur(0px)',
                  zIndex: isExpanded ? 50 : 1
                }}
                transition={{ 
                  delay: isAnyExpanded ? 0 : idx * 0.1, 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 35,
                  mass: 0.8
                }}
                className="relative cursor-pointer group"
                onClick={() => setExpandedId(isExpanded ? null : path.id)}
              >
                
                {/* 
                  GLASSMORPHISM 3.0 - LAYER 2: Reactive Under-Glow
                  Свечение из-под карточки, которое активируется при её раскрытии.
                */}
                <motion.div
                  className="absolute -inset-1 rounded-[36px] z-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isExpanded ? 0.4 : 0,
                    scale: isExpanded ? 1 : 0.9
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ 
                    background: `radial-gradient(circle at 50% 50%, var(--accent), transparent 70%)`,
                    filter: 'blur(24px)'
                  }}
                />

                {/* 
                  GLASSMORPHISM 3.0 - LAYER 3: The Frosted Glass Object
                  Сама карточка с Rim Lighting (внутренней тенью) и Blur.
                */}
                <motion.div 
                  layout
                  className="relative z-10 overflow-hidden backdrop-blur-2xl transition-colors duration-500"
                  style={{
                    backgroundColor: isExpanded ? 'var(--glass-2)' : 'var(--glass-1)',
                    border: `1px solid ${isExpanded ? 'var(--glass-border-2)' : 'var(--glass-2)'}`,
                    borderRadius: isExpanded ? '32px' : '24px',
                    boxShadow: isExpanded 
                      ? '0 40px 80px -20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.1)' 
                      : '0 10px 30px -10px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.08)',
                  }}
                >
                  <motion.div layout className="p-6">
                    
                    {/* Collapsed State Header */}
                    <div className="flex items-center gap-5">
                      <motion.div 
                        layout="position"
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner"
                        style={{ 
                          background: isExpanded ? 'var(--accent)' : 'var(--glass-1)',
                          color: isExpanded ? '#fff' : 'var(--ink)',
                          boxShadow: isExpanded ? '0 10px 20px -5px var(--accent)' : 'inset 0 1px 2px rgba(255,255,255,0.1)'
                        }}
                      >
                        {ICONS[path.id]}
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <motion.p 
                          layout="position" 
                          className="text-[10px] uppercase tracking-[0.15em] font-mono mb-1.5 transition-colors duration-500" 
                          style={{ color: isExpanded ? 'var(--accent)' : 'var(--ink2)' }}
                        >
                          {overline.trim()}
                        </motion.p>
                        <div className="flex items-center gap-2">
                          <motion.h3 
                            layout="position" 
                            className="text-[19px] font-bold leading-tight truncate" 
                            style={{ color: 'var(--ink)' }}
                          >
                            {mainTitle}
                          </motion.h3>
                          {isLocked && (
                            <span
                              className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                              style={{
                                background: 'linear-gradient(135deg, rgba(142,111,62,0.15), rgba(196,163,90,0.15))',
                                border: '1px solid rgba(196,163,90,0.25)',
                                color: '#C4A35A',
                              }}
                            >
                              <Crown size={10} />
                              Pro
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Fluid Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                          exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
                          transition={{ opacity: { duration: 0.3 }, height: { type: 'spring', stiffness: 400, damping: 35 } }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 relative z-20">
                            <p className="text-[14px] leading-[1.6] mb-8" style={{ color: 'var(--ink2)' }}>
                              {path.description}
                            </p>

                            {/* Nested Sub-paths for Glassmorphism */}
                            {path.subPaths ? (
                              <div className="flex flex-col gap-3">
                                {path.subPaths.map(sp => (
                                  <button
                                    key={sp.id}
                                    onClick={(e) => handleStartPath(e, sp.id, sp.phases)}
                                    className="group flex flex-col text-left p-5 rounded-[20px] transition-all duration-300 active:scale-[0.98] hover:bg-white/5"
                                    style={{ 
                                      background: 'rgba(0,0,0,0.1)', 
                                      border: '1px solid var(--glass-border)',
                                      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                                        {ICONS[sp.id]}
                                        <span className="font-bold text-[15px] tracking-tight">{sp.title}</span>
                                      </div>
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 group-hover:bg-white/20 group-hover:scale-110 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                                        <ArrowUpRight size={16} style={{ color: 'var(--ink)' }} />
                                      </div>
                                    </div>
                                    <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--ink2)' }}>
                                      {sp.description}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              /* Action Button in Glass Theme */
                              <button
                                onClick={(e) => handleStartPath(e, path.id, path.phases)}
                                className="w-full py-4 rounded-[16px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden"
                                style={{ 
                                  background: 'var(--accent)', 
                                  color: '#fff', 
                                  boxShadow: '0 12px 30px -10px var(--accent), inset 0 1px 2px rgba(255,255,255,0.4)' 
                                }}
                              >
                                <span className="text-[12px] font-bold uppercase tracking-[0.15em] relative z-10">Инициировать</span>
                                <ArrowRight size={18} className="relative z-10" />
                                
                                {/* Button Highlight reflection */}
                                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

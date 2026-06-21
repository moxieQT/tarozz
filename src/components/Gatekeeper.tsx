import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ArrowRight, ShieldAlert, Check, Home } from 'lucide-react';
import { useAppStore } from '../store';
import { PHASES } from '../data/phases';
import { useNavigate } from 'react-router-dom';

export function Gatekeeper() {
  const { completePhase, activePathPhases, currentPhaseIndex } = useAppStore();
  const currentPhaseId = activePathPhases[currentPhaseIndex] || 0;
  const navigate = useNavigate();
  const phase = PHASES.find(p => p.id === currentPhaseId);

  const [acceptedMarkers, setAcceptedMarkers] = useState<Set<string>>(new Set());
  const [deniedContraindications, setDeniedContraindications] = useState<Set<string>>(new Set());
  const [showError, setShowError] = useState(false);

  if (!phase) return null;

  const isReady =
    acceptedMarkers.size === phase.readinessMarkers.length &&
    deniedContraindications.size === phase.contraindications.length;

  const handleEnter = () => {
    if (isReady) {
      completePhase(currentPhaseId, {});
      if (currentPhaseIndex >= activePathPhases.length - 1) {
        navigate('/safety-plan');
      } else {
        navigate('/dashboard');
      }
    } else {
      setShowError(true);
    }
  };

  const toggleMarker = (id: string) => {
    setShowError(false);
    const newSet = new Set(acceptedMarkers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setAcceptedMarkers(newSet);
  };

  const denyContraindication = (id: string) => {
    setShowError(false);
    const newSet = new Set(deniedContraindications);
    newSet.add(id);
    setDeniedContraindications(newSet);
  };

  const acceptContraindication = (id: string) => {
    setShowError(false);
    const newSet = new Set(deniedContraindications);
    newSet.delete(id);
    setDeniedContraindications(newSet);
  };

  return (
    <div
      className="min-h-screen relative flex flex-col font-sans overflow-x-hidden"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* GLASSMORPHISM 3.0 - LAYER 1: Breathing Atmospheric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(-5%, 10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full "
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.15}}
        />
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full "
          style={{ background: 'radial-gradient(circle, var(--ink) 0%, transparent 70%)', opacity: 0.05}}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="flex-1 w-full px-6 pt-16 pb-24 relative z-10 flex flex-col max-w-2xl mx-auto"
        style={{ color: 'var(--ink)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-xl shadow-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--ink2)' }}
        >
          <Home size={16} />
          <span>Домой</span>
        </button>

        <div className="w-full mt-12 space-y-12">
          {/* Editorial Header */}
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] mb-6 shadow-sm"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <ShieldAlert className="w-8 h-8" style={{ color: 'var(--ink)' }} />
            </div>
            <div className="flex items-center justify-center gap-3 mb-2 opacity-70">
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold" style={{ color: 'var(--ink)' }}>
                Gatekeeper
              </span>
            </div>
            <h2 className="text-4xl font-serif italic tracking-tight leading-[1.05]" style={{ color: 'var(--ink)' }}>
              Фаза {phase.id}:<br />{phase.subtitle}
            </h2>
            <p className="max-w-sm mx-auto text-sm leading-relaxed mt-4" style={{ color: 'var(--ink2)' }}>
              Проверка безопасности перед входом в следующую фазу.
            </p>
          </div>

        {/* Readiness Markers */}
        {phase.readinessMarkers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] mb-6" style={{ color: 'var(--ink3)' }}>
              Маркеры готовности (Требуется подтверждение)
            </h3>
            {phase.readinessMarkers.map(m => (
              <button
                key={m.id}
                onClick={() => toggleMarker(m.id)}
                className="w-full flex items-start text-left p-5 rounded-[20px] transition-all duration-300 backdrop-blur-md"
                style={
                  acceptedMarkers.has(m.id)
                    ? { background: 'var(--card)', border: '1px solid var(--accent)', color: 'var(--ink)', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)' }
                    : { background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--ink2)' }
                }
              >
                <div
                  className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center mr-4 transition-colors"
                  style={
                    acceptedMarkers.has(m.id)
                      ? { background: 'var(--accent)', border: '1px solid var(--accent)', color: '#fff' }
                      : { border: '1px solid var(--border)', background: 'var(--sunken)' }
                  }
                >
                  {acceptedMarkers.has(m.id) && <Check size={14} className="stroke-[3]" />}
                </div>
                <span className="leading-relaxed">{m.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Contraindications */}
        {phase.contraindications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.18em] mb-6 flex items-center" style={{ color: 'var(--ink3)' }}>
              <AlertTriangle size={14} className="mr-2 text-red-400" />
              Противопоказания (Требуется отрицание)
            </h3>
            {phase.contraindications.map(c => {
              const isDenied = deniedContraindications.has(c.id);
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-[20px] transition-all duration-300 backdrop-blur-md"
                  style={{
                    padding: '16px 18px',
                    background: isDenied ? 'var(--card)' : 'var(--sunken)',
                    border: `1px solid ${isDenied ? 'var(--accent)' : 'var(--border)'}`,
                    boxShadow: isDenied ? '0 10px 20px -5px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <span className="text-[14px] leading-[1.5]" style={{ color: 'var(--ink)' }}>{c.text}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => denyContraindication(c.id)}
                      className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-all duration-200"
                      style={
                        isDenied
                          ? { background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }
                          : { background: 'var(--surface)', color: 'var(--ink2)', border: '1px solid var(--border)' }
                      }
                    >
                      Нет
                    </button>
                    <button
                      onClick={() => acceptContraindication(c.id)}
                      className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-all duration-200"
                      style={{ background: 'var(--surface)', color: 'var(--ink2)', border: '1px solid var(--border)' }}
                    >
                      Да
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="p-4 rounded-xl text-sm text-center"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
            >
              Необходимо подтвердить все пункты для соблюдения техники безопасности.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8">
          <button
            onClick={handleEnter}
            className={`w-full py-4 rounded-[16px] flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
              isReady ? 'active:scale-[0.98]' : 'opacity-60 cursor-not-allowed'
            }`}
            style={{ 
              background: isReady ? 'var(--accent)' : 'var(--sunken)', 
              color: isReady ? '#fff' : 'var(--ink3)', 
              boxShadow: isReady ? '0 12px 30px -10px var(--accent)' : 'none',
              border: isReady ? 'none' : '1px solid var(--border)'
            }}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] relative z-10">Завершить фазу</span>
            <ArrowRight size={18} className="relative z-10" />
            
            {/* Button Highlight reflection */}
            {isReady && <div className={`absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out`} />}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
  );
}

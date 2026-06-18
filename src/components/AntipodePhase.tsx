import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Home } from 'lucide-react';
import { useAppStore } from '../store';
import { INITIAL_CARDS } from '../data';
import { CardType } from '../types';
import { useNavigate } from 'react-router-dom';

export function AntipodePhase() {
  const { completePhase, savedCards, currentPhaseIndex, activePathPhases } = useAppStore();
  const currentPhaseId = activePathPhases[currentPhaseIndex] || 0;
  const navigate = useNavigate();
  const [imageError, setImageError] = React.useState(false);

  const baseCard = savedCards.length > 0 ? savedCards[0] : INITIAL_CARDS[0];

  const cardNumMatch = baseCard.id.match(/\d+/);
  const cardNum = cardNumMatch ? cardNumMatch[0].padStart(2, '0') : '01';

  const antipodeCard: CardType = {
    ...baseCard,
    id: `antipode-${baseCard.id}`,
    title: baseCard.title.replace('Карта Инсайта', 'Антипод').replace('Гиперфикс на ХП', 'Антипод'),
    description: `[Антипод] Представьте себе совершенно противоположное состояние или решение для этой ситуации. Как бы оно выглядело? ${baseCard.description}`,
    imageUrl: `/4_antipode/anti_${cardNum}.jpeg`
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
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen"
          style={{ background: 'var(--accent)', opacity: 0.15, filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full mix-blend-screen"
          style={{ background: 'var(--ink)', opacity: 0.05, filter: 'blur(100px)' }}
        />
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-xl"
        style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)', color: 'var(--ink2)' }}
      >
        <Home size={16} />
        <span>Домой</span>
      </button>

      <div
        className="flex-1 overflow-hidden relative flex flex-col w-full max-w-2xl mx-auto z-10"
      >
        <div className="flex-1 min-h-0 flex flex-col items-center p-6 pt-24 pb-8 relative z-10 max-w-[380px] w-full mx-auto">
          <div className="text-center mb-8 flex-shrink-0">
            <h2 className="text-5xl font-serif italic mb-4 leading-tight" style={{ color: 'var(--ink)' }}>Ваш<br/>Антипод</h2>
            <p className="text-[12px] uppercase tracking-[0.2em] font-mono font-bold" style={{ color: 'var(--ink3)' }}>
              Основано на выборе из Картографии.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full flex-1 min-h-0 rounded-[32px] relative overflow-hidden flex flex-col backdrop-blur-xl"
            style={{ 
              background: 'var(--glass-2)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          >
            {antipodeCard.imageUrl && !imageError && (
              <img
                src={antipodeCard.imageUrl}
                alt={antipodeCard.title}
                onError={() => setImageError(true)}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                style={{ opacity: 0.8 }}
              />
            )}
            {/* Target glow effect inside card */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 60%)' }} />
          </motion.div>
        </div>

        <div className="px-6 pb-12 relative z-10 w-full max-w-[380px] mx-auto">
          <button
            onClick={() => {
              completePhase(currentPhaseId, {});
              if (currentPhaseIndex >= activePathPhases.length - 1) {
                navigate('/safety-plan');
              } else {
                navigate('/dashboard');
              }
            }}
            className={`w-full py-5 rounded-[16px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden group`}
            style={{ 
              background: 'var(--accent)', 
              color: '#fff', 
              boxShadow: '0 12px 30px -10px var(--accent), inset 0 1px 2px rgba(255,255,255,0.4)',
              border: 'none'
            }}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] relative z-10">Завершить фазу</span>
            <ArrowRight size={18} className="relative z-10" />
            
            {/* Button Highlight reflection */}
            <div className={`absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out`} />
          </button>
        </div>
      </div>
    </div>
  );
}

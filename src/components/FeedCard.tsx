import React from 'react';
import { CardType } from '../types';
import { motion } from 'motion/react';

interface FeedCardProps {
  card: CardType;
  isActive: boolean;
  onTap: (card: CardType) => void;
  index: number;
  total: number;
}

export const FeedCard: React.FC<FeedCardProps> = ({ card, isActive, onTap, index, total }) => {
  const cardNum = card.id.split('-')[1] || '?';

  return (
    <div className="snap-section w-full h-[100dvh] pb-[80px] flex items-center justify-center p-6 relative">
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => onTap(card)}
        className="w-full max-w-[360px] max-h-[720px] aspect-[5/9] rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden relative cursor-pointer"
        style={{ background: 'var(--card)', border: '2px solid var(--hair)' }}
      >
        {/* Image area */}
        <div
          className="h-[85%] relative flex flex-col items-center justify-center p-0 overflow-hidden"
          style={{ background: 'var(--placeholder)', borderBottom: '1px solid var(--hair)' }}
        >
          {card.imageUrl ? (
            <>
              <img src={card.imageUrl} alt={card.title} className="w-full h-full object-contain" />
              {/* Bottom gradient for readability */}
              <div
                className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
              />
              <div className="absolute bottom-4 left-5 right-5 z-10">
                <div className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1">
                  Arcanum {cardNum}
                </div>
                <div className="text-xl font-serif italic text-white leading-tight">
                  {card.title}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Decorative frame for placeholder */}
              <div
                className="absolute inset-4 flex items-center justify-center pointer-events-none"
                style={{ border: '1px solid var(--ink-soft)' }}
              >
                <span className="text-8xl font-serif italic" style={{ color: 'var(--ink)', opacity: 0.08 }}>
                  {cardNum}
                </span>
              </div>
              <div className="absolute bottom-4 left-5 z-10">
                <div
                  className="text-[10px] uppercase tracking-widest font-bold mb-1"
                  style={{ color: 'var(--ink)', opacity: 0.5 }}
                >
                  Arcanum {cardNum}
                </div>
                <div className="text-xl font-serif italic leading-tight" style={{ color: 'var(--ink)' }}>
                  {card.title}
                </div>
              </div>
            </>
          )}

          {/* Card counter pill */}
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono backdrop-blur-md z-10"
            style={{
              background: 'var(--bar)',
              border: '1px solid var(--border)',
              color: 'var(--ink2)',
            }}
          >
            {index + 1}/{total}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-4 py-3 flex-1 flex items-center justify-between"
          style={{ background: 'var(--card)' }}
        >
          <span
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: 'var(--ink)' }}
          >
            Калибровка
          </span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--ink3)' }}>
            Нажмите →
          </span>
        </div>
      </motion.div>
    </div>
  );
};

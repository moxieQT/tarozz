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
    <div className="snap-section w-full h-[100dvh] pb-[80px] flex items-center justify-center p-4 relative">
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => onTap(card)}
        className="w-full max-w-[420px] max-h-[85dvh] h-full rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden relative cursor-pointer"
        style={{ background: 'var(--card)', border: '2px solid var(--hair)' }}
      >
        {/* Image area */}
        <div
          className="flex-1 relative flex flex-col items-center justify-center p-0 overflow-hidden"
          style={{ background: 'transparent' }}
        >
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={card.title} loading="lazy" className="w-full h-full object-contain" />
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
          className="px-5 py-4 flex flex-col justify-center"
          style={{ background: 'var(--card)', borderTop: '1px solid var(--hair)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <span
                className="text-[10px] uppercase tracking-widest font-bold mb-1"
                style={{ color: 'var(--ink3)' }}
              >
                Arcanum {cardNum}
              </span>
              <span className="text-lg font-serif italic leading-tight text-left" style={{ color: 'var(--ink)' }}>
                {card.title}
              </span>
            </div>
            <span className="text-[10px] font-mono whitespace-nowrap ml-4" style={{ color: 'var(--ink3)' }}>
              Калибровка →
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

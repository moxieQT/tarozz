import React from 'react';
import { useAppStore } from '../store';
import { LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DeckPage: React.FC = () => {
  const { savedCards, removeCard } = useAppStore();

  // Intensity distribution (5 bins)
  const bins = [0, 0, 0, 0, 0];
  savedCards.forEach(c => {
    let index = Math.min(Math.floor((c.intensity - 1) / 20), 4);
    if (index < 0) index = 0;
    bins[index]++;
  });
  const maxBin = Math.max(...bins, 1);

  // Average intensity
  const avgIntensity = savedCards.length > 0
    ? Math.round(savedCards.reduce((s, c) => s + c.intensity, 0) / savedCards.length)
    : 0;

  if (savedCards.length === 0) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center px-8 text-center pb-20 relative z-10"
        style={{ backgroundColor: 'var(--sunken)' }}
      >
        <div
          className="w-24 h-24 flex items-center justify-center mb-6 rounded-2xl backdrop-blur-sm"
          style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
        >
          <LayoutGrid size={40} style={{ color: 'var(--ink)' }} />
        </div>
        <h2 className="text-3xl font-serif italic mb-3" style={{ color: 'var(--ink)' }}>
          Колода пуста
        </h2>
        <p
          className="text-[11px] leading-relaxed uppercase tracking-widest font-bold"
          style={{ color: 'var(--ink2)' }}
        >
          Сохраняйте карты из ленты
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-[100px] px-5 pt-8 relative z-10">
      {/* Header */}
      <div className="mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
          style={{ color: 'var(--ink3)' }}
        >
          Личная коллекция
        </div>
        <h1 className="text-3xl font-serif italic leading-none" style={{ color: 'var(--ink)' }}>
          Моя колода
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4">
          <div
            className="flex-1 rounded-xl p-3"
            style={{ background: 'var(--sunken)', border: '1px solid var(--border)' }}
          >
            <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink3)' }}>
              Карт
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              {savedCards.length}
            </div>
          </div>
          <div
            className="flex-1 rounded-xl p-3"
            style={{ background: 'var(--sunken)', border: '1px solid var(--border)' }}
          >
            <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink3)' }}>
              Средняя
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--accent-ink)' }}>
              {avgIntensity}%
            </div>
          </div>
          <div
            className="flex-1 rounded-xl p-3"
            style={{ background: 'var(--sunken)', border: '1px solid var(--border)' }}
          >
            <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink3)' }}>
              Распр.
            </div>
            <div className="flex items-end h-5 gap-[3px]">
              {bins.map((count, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[2px] transition-all duration-500"
                  style={{
                    height: `${Math.max((count / maxBin) * 100, 12)}%`,
                    background: count > 0 ? 'var(--accent)' : 'var(--placeholder)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {savedCards.map((card, idx) => {
            let myBin = Math.min(Math.floor((card.intensity - 1) / 20), 4);
            if (myBin < 0) myBin = 0;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20, scale: 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                whileTap={{ scale: 0.96 }}
                transition={{ delay: idx * 0.04 }}
                key={card.id}
                onClick={() => removeCard(card.id)}
                className="relative aspect-[2/3] flex flex-col justify-between overflow-hidden shadow-sm cursor-pointer group rounded-xl transition-colors"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--hair)',
                }}
              >
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20"
                  style={{ background: 'var(--scrim)' }}
                >
                  <span
                    className="font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm"
                    style={{
                      color: 'var(--ink)',
                      background: 'var(--card)',
                      border: '1px solid var(--hair)',
                    }}
                  >
                    Убрать
                  </span>
                </div>

                {/* Image area */}
                <div
                  className="h-[82%] relative overflow-hidden flex items-center justify-center transition-colors"
                  style={{
                    background: 'var(--placeholder)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.title} className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <span
                        className="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-widest font-bold z-10"
                        style={{ color: 'var(--ink)', opacity: 0.5 }}
                      >
                        {card.id.split('-')[1]}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-4xl font-serif italic" style={{ color: 'var(--ink)', opacity: 0.06 }}>
                          {card.id.split('-')[1]}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom info */}
                <div className="px-2.5 py-2 relative z-10 flex flex-col flex-1 justify-center" style={{ background: 'var(--card)' }}>
                  <div className="w-full">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex items-end h-3 gap-[2px]" title="Распределение">
                        {bins.map((count, i) => (
                          <div
                            key={i}
                            className="w-[3px] rounded-t-[1px] transition-all duration-500 ease-out"
                            style={{
                              height: `${Math.max((count / maxBin) * 100, 15)}%`,
                              background: i === myBin ? 'var(--accent)' : 'var(--placeholder)',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--ink)' }}>
                        {card.intensity}%
                      </span>
                    </div>
                    <div className="w-full h-[2px] rounded-full" style={{ background: 'var(--placeholder)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${card.intensity}%`, background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

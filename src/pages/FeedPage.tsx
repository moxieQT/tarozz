import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { FeedCard } from '../components/FeedCard';
import { BottomSheet } from '../components/BottomSheet';
import { CardType } from '../types';
import { Layers, Crown } from 'lucide-react';
import { INITIAL_CARDS } from '../data';
import { getCardLimit } from '../data/subscription';
import { MyelinSegmentToast } from '../components/neuro';

export const FeedPage: React.FC = () => {
  const { removedIds, saveCard, savedCards, subscription, openPaywall, recordActivity } = useAppStore();
  const cardLimit = getCardLimit(subscription);
  const atLimit = savedCards.length >= cardLimit && subscription === 'free';

  const availableCards = INITIAL_CARDS.filter(card => !removedIds.includes(card.id));
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [toastIntensity, setToastIntensity] = useState<number | null>(null);
  const [insightText, setInsightText] = useState<string | undefined>(undefined);

  const totalCards = subscription === 'premium' ? INITIAL_CARDS.length : cardLimit;
  const reviewedCount = savedCards.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCard) return;
      if (!containerRef.current) return;
      const height = containerRef.current.clientHeight;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: height, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: -height, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard]);

  const handleTap = (card: CardType) => {
    if (atLimit) {
      openPaywall('card_limit');
      return;
    }
    setSelectedCard(card);
  };

  const handleSave = async (intensity: number) => {
    if (selectedCard) {
      saveCard(selectedCard, intensity);
      recordActivity();
      setSelectedCard(null);
      
      // Setup Toast
      setToastIntensity(intensity);
      setInsightText("Миелинизация формируется...");
      
      // Fetch insight text
      setTimeout(() => {
        setInsightText(intensity < 40 ? "Рутинная перестройка нейронных путей." : intensity < 70 ? "Миелинизация активирована. Скорость проведения увеличивается." : "Зафиксирована долгосрочная потенциация.");
      }, 500);
    }
  };

  if (atLimit) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center px-8 text-center pb-20 relative z-10"
        style={{ backgroundColor: 'var(--sunken)' }}
      >
        <div
          className="w-24 h-24 flex items-center justify-center mb-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(142,111,62,0.15), rgba(196,163,90,0.15))',
            border: '1px solid rgba(196,163,90,0.25)',
          }}
        >
          <Crown size={40} style={{ color: '#C4A35A' }} />
        </div>
        <h2 className="text-2xl font-serif italic mb-3" style={{ color: 'var(--ink)' }}>
          Достигнут лимит
        </h2>
        <p
          className="text-[12px] leading-relaxed mb-6 max-w-[260px]"
          style={{ color: 'var(--ink2)' }}
        >
          Вы сохранили {cardLimit} карт — максимум для бесплатного плана. Premium открывает доступ ко всем 79 картам колоды.
        </p>
        <button
          onClick={() => openPaywall('card_limit')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(135deg, #8E6F3E, #C4A35A)',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(142,111,62,0.3)',
          }}
        >
          <Crown size={16} />
          Разблокировать все карты
        </button>
      </div>
    );
  }

  if (availableCards.length === 0) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center px-8 text-center pb-20 relative z-10"
        style={{ backgroundColor: 'var(--sunken)' }}
      >
        <div
          className="w-24 h-24 flex items-center justify-center mb-6 rounded-2xl backdrop-blur-sm"
          style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
        >
          <Layers size={40} style={{ color: 'var(--ink)' }} />
        </div>
        <h2 className="text-3xl font-serif italic mb-3" style={{ color: 'var(--ink)' }}>
          Колода собрана
        </h2>
        <p
          className="text-[11px] leading-relaxed uppercase tracking-widest font-bold"
          style={{ color: 'var(--ink2)' }}
        >
          Все {totalCards} карт просмотрены · {reviewedCount} сохранено
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="h-[3px] w-full" style={{ background: 'var(--placeholder)' }}>
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0}%`,
              background: 'var(--accent)',
            }}
          />
        </div>
        <div
          className="flex justify-between items-center px-4 py-2 text-[10px] font-mono uppercase tracking-wider"
          style={{ color: 'var(--ink3)' }}
        >
          <span>Лента карт</span>
          <span>
            {reviewedCount}/{totalCards} изучено
          </span>
        </div>
      </div>

      <div ref={containerRef} className="snap-container pb-24 absolute inset-0 z-10 pt-8">
        {availableCards.map((card, idx) => (
          <FeedCard
            key={card.id}
            card={card}
            isActive={true}
            onTap={handleTap}
            index={reviewedCount + idx}
            total={totalCards}
          />
        ))}
      </div>

      <BottomSheet
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        card={selectedCard}
        onSave={handleSave}
      />
      <MyelinSegmentToast 
        isVisible={toastIntensity !== null}
        intensity={toastIntensity || 0}
        insightText={insightText}
        onComplete={() => setToastIntensity(null)}
      />
    </div>
  );
};

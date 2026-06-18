import React from 'react';
import { useAppStore } from '../store';
import { Layers, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, savedCards } = useAppStore();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 backdrop-blur-xl pb-safe pb-4 pt-2 px-6 z-30"
      style={{
        backgroundColor: 'var(--bar)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex justify-around items-center max-w-sm mx-auto h-14">
        <button
          onClick={() => setActiveTab('feed')}
          className="relative flex flex-col items-center gap-1.5 transition-colors"
          style={{ color: activeTab === 'feed' ? 'var(--accent-ink)' : 'var(--ink3)' }}
        >
          {activeTab === 'feed' && (
            <motion.div
              layoutId="navBlob"
              className="absolute -inset-x-4 -inset-y-2 rounded-2xl -z-10"
              style={{ background: 'var(--node)' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Layers size={20} style={{ strokeWidth: activeTab === 'feed' ? 2 : 1.5 }} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Лента</span>
        </button>

        <button
          onClick={() => setActiveTab('deck')}
          className="relative flex flex-col items-center gap-1.5 transition-colors"
          style={{ color: activeTab === 'deck' ? 'var(--accent-ink)' : 'var(--ink3)' }}
        >
          {activeTab === 'deck' && (
            <motion.div
              layoutId="navBlob"
              className="absolute -inset-x-4 -inset-y-2 rounded-2xl -z-10"
              style={{ background: 'var(--node)' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative">
            <LayoutGrid size={20} style={{ strokeWidth: activeTab === 'deck' ? 2 : 1.5 }} />
            {savedCards.length > 0 && (
              <div
                className="absolute -top-1 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                style={{ background: 'var(--accent)' }}
              >
                {savedCards.length}
              </div>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold">Колода</span>
        </button>
      </div>
    </div>
  );
};

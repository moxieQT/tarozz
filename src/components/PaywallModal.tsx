import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Crown, Layers, Brain, Headphones, Download,
  BookOpen, Flame, Shield, Sparkles, Check,
} from 'lucide-react';
import { useAppStore } from '../store';
import { PRICING_OPTIONS } from '../data/subscription';

const FEATURES = [
  { icon: <Layers size={16} />, text: 'Полная колода — 79 карт с многослойным контентом' },
  { icon: <Brain size={16} />, text: 'Все 4 режима включая терапевтический и кризисный' },
  { icon: <Sparkles size={16} />, text: 'AI-рефлексия после каждой фазы' },
  { icon: <BookOpen size={16} />, text: 'Инсайт-журнал с историей прохождений' },
  { icon: <Headphones size={16} />, text: 'Аудио-слой для дыхательных практик' },
  { icon: <Download size={16} />, text: 'PDF-экспорт плана безопасности и отчётов' },
  { icon: <Flame size={16} />, text: 'Серии практики и система достижений' },
  { icon: <Shield size={16} />, text: 'Тёмная тема и расширенные настройки' },
];

export function PaywallModal() {
  const { showPaywall, paywallTrigger, closePaywall, setSubscription } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handlePurchase = () => {
    // In production: integrate with Stripe / App Store / Google Play
    // For now: simulate purchase
    setSubscription('premium');
  };

  return (
    <AnimatePresence>
      {showPaywall && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] backdrop-blur-xl"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={closePaywall}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[440px] z-[201] overflow-y-auto rounded-[28px] backdrop-blur-3xl"
            style={{
              background: 'var(--glass-2)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
            }}
          >
            {/* Close button */}
            <button
              onClick={closePaywall}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
              style={{
                background: 'var(--glass-2)',
                border: '1px solid var(--glass-border)',
                color: 'var(--ink2)',
              }}
            >
              <X size={18} />
            </button>

            <div className="p-6 pt-8 pb-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 25 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] mb-5"
                  style={{
                    background: 'linear-gradient(135deg, #8E6F3E 0%, #C4A35A 100%)',
                    boxShadow: '0 12px 24px -4px rgba(142,111,62,0.4)',
                  }}
                >
                  <Crown size={28} color="#fff" />
                </motion.div>

                <h2
                  className="text-3xl font-serif italic tracking-tight mb-2"
                  style={{ color: 'var(--ink)' }}
                >
                  Premium
                </h2>
                <p className="text-sm leading-relaxed max-w-[300px] mx-auto" style={{ color: 'var(--ink2)' }}>
                  {paywallTrigger === 'mode_locked'
                    ? 'Этот режим доступен в Premium. Разблокируйте полный доступ.'
                    : paywallTrigger === 'card_limit'
                    ? 'Вы достигли лимита бесплатных карт. Premium открывает всю колоду.'
                    : paywallTrigger === 'feature'
                    ? 'Эта функция доступна в Premium.'
                    : 'Откройте полный доступ к терапевтическому инструментарию.'}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-3">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                    className="flex items-start gap-3 text-[13px] leading-relaxed"
                    style={{ color: 'var(--ink)' }}
                  >
                    <span className="mt-0.5 shrink-0 opacity-60">{f.icon}</span>
                    <span>{f.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Pricing cards */}
              <div className="space-y-3 mb-6">
                {PRICING_OPTIONS.map((option) => {
                  const isSelected = selectedPlan === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedPlan(option.id)}
                      className="w-full p-4 rounded-[16px] flex items-center gap-4 text-left transition-all duration-200"
                      style={{
                        background: isSelected ? 'var(--glass-border)' : 'var(--glass-1)',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--glass-2)'}`,
                        boxShadow: isSelected
                          ? '0 8px 20px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.15)'
                          : 'none',
                      }}
                    >
                      {/* Radio */}
                      <div
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all"
                        style={{
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border-2)'}`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                        }}
                      >
                        {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>
                            {option.label}
                          </span>
                          {option.badge && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
                              style={{ background: 'var(--accent)' }}
                            >
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {option.savings && (
                          <span className="text-[11px] font-mono" style={{ color: 'var(--accent-ink)' }}>
                            {option.savings} по сравнению с ежемесячной
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <div className="text-[16px] font-bold" style={{ color: 'var(--ink)' }}>
                          {option.price}
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--ink3)' }}>
                          {option.priceSubtext}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={handlePurchase}
                className="w-full py-5 rounded-[16px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #8E6F3E 0%, #C4A35A 100%)',
                  color: '#fff',
                  boxShadow: '0 12px 30px -10px rgba(142,111,62,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
                }}
              >
                <Crown size={18} className="relative z-10" />
                <span className="text-[12px] font-bold uppercase tracking-[0.15em] relative z-10">
                  Активировать Premium
                </span>
                <div className="absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
              </button>

              {/* Legal */}
              <p
                className="text-center text-[10px] mt-4 leading-relaxed"
                style={{ color: 'var(--ink3)' }}
              >
                Подписка продлевается автоматически. Отменить можно в любой момент.
                <br />
                Нажимая «Активировать», вы соглашаетесь с условиями использования.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

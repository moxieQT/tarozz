import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { useAppStore } from '../store';
import { Layers, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INTERVENTION_CARDS = [
  { id: 1, title: 'Темп-Дроп', series: 'I Регуляция', modality: 'ДБТ ТИПП-Т (рефлекс ныряльщика)', goal: 'Острая дисрегуляция, паника, импульс селфхарма' },
  { id: 2, title: 'Дыхание-Якорь', series: 'I Регуляция', modality: 'ДБТ ТИПП-П, поливагальная регуляция', goal: 'Фоновая тревога, гипербдительность, тремор' },
  { id: 3, title: 'Земля', series: 'I Регуляция', modality: 'Соматическое заземление, bottom-up', goal: 'Диссоциация, дереализация, флешбэки' },
  { id: 4, title: 'Сброс Через Тело', series: 'I Регуляция', modality: 'ДБТ ТИПП-И, ТОП', goal: 'Гнев, агрессия, моторное беспокойство' },
  { id: 5, title: 'Мышца СТОП', series: 'II Пауза', modality: 'ДБТ СТОП, поведенческое торможение', goal: 'Компульсивный чекинг, думскроллинг, импульсивные реакции' },
  { id: 6, title: 'Свидетель', series: 'II Пауза', modality: 'ACT (дефузия), IFS (Self)', goal: 'Навязчивые мысли, слияние, катастрофизация' },
  { id: 7, title: '15 Минут', series: 'II Пауза', modality: 'КПТ ERP, urge surfing', goal: 'Зависимое поведение, тяга, импульсивность' },
  { id: 8, title: 'Лог Мысли', series: 'III Переосмысление', modality: 'КПТ (дневник мыслей)', goal: 'Руминации, негативный фильтр, ГТР' },
  { id: 9, title: 'Весы', series: 'III Переосмысление', modality: 'КПТ (сократический диалог, декатастрофизация)', goal: 'Катастрофизация, иррациональные страхи' },
  { id: 10, title: 'Ценности', series: 'III Переосмысление', modality: 'ACT (прояснение ценностей)', goal: 'Избегание, прокрастинация, потеря смысла, апатия' },
  { id: 11, title: 'Голос', series: 'IV Выражение', modality: 'ТОП (вокализация), поливагальная стимуляция', goal: 'Подавленные эмоции, ком в горле, алекситимия' },
  { id: 12, title: 'Письмо', series: 'IV Выражение', modality: 'Нарративная, экспрессивное письмо, гештальт', goal: 'Незавершённое горе, расставание, обида' },
  { id: 13, title: 'Тело Движется', series: 'IV Выражение', modality: 'ТДТ, соматическое переживание', goal: 'Телесные блоки, оцепенение, затяжной стресс' },
  { id: 14, title: 'Само-Объятие', series: 'V Само-отношение', modality: 'EMDR (БЛС), CFT', goal: 'Токсичный стыд, острый дистресс, самобичевание' },
  { id: 15, title: 'Родитель Внутри', series: 'V Само-отношение', modality: 'Схема-терапия (репарентинг), IFS', goal: 'Внутренний критик, покинутость, детская травма' },
  { id: 16, title: 'Новая Роль', series: 'V Само-отношение', modality: 'IFS (снятие бремени)', goal: 'Истощение от гиперконтроля, ригидные защиты' },
  { id: 17, title: 'Протянуть Руку', series: 'VI Связь', modality: 'ДБТ (межличностная эффективность), EFT', goal: 'Изоляция, страх близости, избегающая привязанность' },
  { id: 18, title: 'Два Стула', series: 'VI Связь', modality: 'Гештальт, схема, IFS (диалог частей)', goal: 'Внутренний конфликт, амбивалентность, незавершённость' },
];

const SWIPE_THRESHOLD = 100;

interface CardProps {
  card: typeof INTERVENTION_CARDS[0];
  isFront: boolean;
  onSwipe: () => void;
  index: number;
  total: number;
}

const Card: React.FC<CardProps> = ({ card, isFront, onSwipe, index, total }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onSwipe();
    }
  };

  const seriesLabel = `${index + 1}/${total} · Серия ${card.series}`;

  if (!isFront) {
    return (
      <div
        className="absolute inset-0 w-full max-w-[340px] aspect-[3/4] mx-auto rounded-[32px] flex flex-col overflow-hidden opacity-90 scale-95 origin-bottom backdrop-blur-md"
        style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.2)' }}
      >
        {/* Amber top stripe */}
        <div className="h-40 flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--glass-1)', borderBottom: '1px solid var(--glass-border)', borderTopWidth: '4px', borderTopColor: 'var(--accent)' }}>
          <h3 className="text-3xl font-serif italic leading-tight text-center relative z-10" style={{ color: 'var(--ink)' }}>{card.title}</h3>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity, background: 'var(--glass-2)', border: '1px solid var(--glass-border-2)', boxShadow: '0 30px 60px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 w-full max-w-[340px] aspect-[3/4] mx-auto rounded-[32px] flex flex-col overflow-hidden origin-bottom cursor-grab active:cursor-grabbing backdrop-blur-2xl"
    >
      {/* Target glow effect */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 60%)' }} />

      {/* Accent top stripe on front card header */}
      <div
        className="h-40 flex items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'var(--glass-1)', borderBottom: '1px solid var(--glass-border)', borderTopWidth: '4px', borderTopColor: 'var(--accent)' }}
      >
        <span className="absolute top-4 left-5 text-[9px] uppercase tracking-[0.2em] font-mono font-bold" style={{ color: 'var(--ink3)' }}>
          {seriesLabel}
        </span>
        <span className="absolute top-4 right-5 text-[9px] uppercase tracking-[0.2em] font-mono font-bold" style={{ color: 'var(--ink3)' }}>
          №{card.id}
        </span>
        <h3 className="text-4xl font-serif italic leading-[1.1] text-center relative z-10" style={{ color: 'var(--ink)' }}>{card.title}</h3>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
        <div className="mb-8 p-5 rounded-[16px]" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold mb-3" style={{ color: 'var(--ink3)' }}>Модальность</h4>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ink)' }}>{card.modality}</p>
        </div>

        <div className="p-5 rounded-[16px]" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold mb-3" style={{ color: 'var(--ink3)' }}>Клиническая цель</h4>
          <p className="font-serif italic text-xl leading-snug" style={{ color: 'var(--ink)' }}>{card.goal}</p>
        </div>

        <div className="mt-auto pt-6 flex justify-center opacity-50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--ink)' }}>Свайп</span>
        </div>
      </div>
    </motion.div>
  );
};

export function InterventionPhase() {
  const { completePhase, currentPhaseIndex, activePathPhases } = useAppStore();
  const currentPhaseId = activePathPhases[currentPhaseIndex] || 0;
  const navigate = useNavigate();
  const [cards, setCards] = useState(INTERVENTION_CARDS);
  const [swipeCount, setSwipeCount] = useState(0);

  const handleSwipe = () => {
    setSwipeCount(c => c + 1);
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const currentIndex = swipeCount % INTERVENTION_CARDS.length;

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
        {/* Mint dots */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(50,80,70,0.16) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="pt-20 px-8 pb-4 relative z-20 text-center pointer-events-none mt-12">
          <h2 className="text-4xl font-serif italic mb-3 leading-tight" style={{ color: 'var(--ink)' }}>Колода<br/>Интервенций</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold" style={{ color: 'var(--ink3)' }}>18 Универсальных Карт</p>
        </div>

        <div className="flex-1 relative flex items-center justify-center p-6 z-10">
          <div className="relative w-full max-w-[340px] aspect-[3/4]">
            {cards.length > 1 && (
              <Card
                key={`back-${cards[1].id}`}
                card={cards[1]}
                isFront={false}
                onSwipe={() => {}}
                index={(currentIndex + 1) % INTERVENTION_CARDS.length}
                total={INTERVENTION_CARDS.length}
              />
            )}

            {cards.length > 0 && (
              <AnimatePresence>
                <Card
                  key={`front-${cards[0].id}`}
                  card={cards[0]}
                  isFront={true}
                  onSwipe={handleSwipe}
                  index={currentIndex}
                  total={INTERVENTION_CARDS.length}
                />
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="px-6 pb-12 relative z-10 max-w-[340px] mx-auto w-full">
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

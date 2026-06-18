import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Crown, User, Flame, Layers, RefreshCw,
  Calendar, ChevronDown, Lock, Star, BookOpen, 
  Eye, Heart, Compass, Zap, PenTool, Moon,
  Shield, Mail, Repeat, Settings, Brain, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, CycleRecord } from '../store';
import { useTheme } from '../context/ThemeContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, Achievement } from '../data/achievements';
import { TIER_CONFIG } from '../data/subscription';
import { PHASES } from '../data/phases';
import { HippocampalView, Neuron, NeuronStats, NeuronStatsData } from '../components/neuro';

const PHASE_NAMES: Record<number, string> = Object.fromEntries(
  PHASES.map(p => [p.id, p.subtitle])
);

// ─── Icon resolver ───
const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  'eye': <Eye size={18} />,
  'refresh-cw': <RefreshCw size={18} />,
  'pen-tool': <PenTool size={18} />,
  'moon': <Moon size={18} />,
  'zap': <Zap size={18} />,
  'mail': <Mail size={18} />,
  'shield': <Shield size={18} />,
  'flame': <Flame size={18} />,
  'layers': <Layers size={18} />,
  'heart': <Heart size={18} />,
  'compass': <Compass size={18} />,
  'repeat': <Repeat size={18} />,
};

// ─── Heat Map (last 12 weeks) ───
function HeatMap({ activeDays }: { activeDays: string[] }) {
  const weeks = 12;
  const today = new Date();
  const cells: { date: string; active: boolean; dayOfWeek: number }[] = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    cells.push({ date: iso, active: activeDays.includes(iso), dayOfWeek: d.getDay() });
  }

  // Group into weeks (columns)
  const weekColumns: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weekColumns.push(cells.slice(i, i + 7));
  }

  return (
    <div className="flex gap-[3px] justify-center">
      {weekColumns.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((cell, ci) => (
            <div
              key={ci}
              className="w-[10px] h-[10px] rounded-[2px] transition-colors"
              title={cell.date}
              style={{
                background: cell.active ? 'var(--accent)' : 'var(--glass-2)',
                opacity: cell.active ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-[20px] p-5 flex flex-col gap-2 backdrop-blur-2xl transition-all"
      style={{
        background: 'var(--glass-2)',
        border: '1px solid var(--glass-border-2)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.15)',
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: accent || 'var(--ink3)' }}>{icon}</span>
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-bold" style={{ color: accent || 'var(--ink3)' }}>
          {label}
        </span>
      </div>
      <span className="text-3xl font-bold font-serif tracking-tight" style={{ color: accent || 'var(--ink)' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Achievement Card ───
const AchievementItem: React.FC<{
  achievement: Achievement;
  unlocked: boolean;
  premium: boolean;
  isPremiumUser: boolean;
}> = ({ achievement, unlocked, premium, isPremiumUser }) => {
  const locked = premium && !isPremiumUser;
  const catColor = ACHIEVEMENT_CATEGORIES[achievement.category].color;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-[16px] transition-all backdrop-blur-md"
      style={{
        background: unlocked ? 'var(--glass-2)' : 'var(--glass-1)',
        border: `1px solid ${unlocked ? catColor + '40' : 'var(--glass-border)'}`,
        boxShadow: unlocked ? '0 10px 20px -5px rgba(0,0,0,0.05)' : 'none',
        opacity: unlocked ? 1 : locked ? 0.4 : 0.55,
      }}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
        style={{
          background: unlocked ? catColor + '20' : 'var(--glass-1)',
          color: unlocked ? catColor : 'var(--ink3)',
        }}
      >
        {locked ? <Lock size={16} /> : (ACHIEVEMENT_ICONS[achievement.icon] || <Star size={16} />)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold truncate" style={{ color: unlocked ? 'var(--ink)' : 'var(--ink3)' }}>
          {achievement.title}
        </div>
        <div className="text-[11px] truncate" style={{ color: 'var(--ink3)' }}>
          {locked ? 'Premium' : achievement.condition}
        </div>
      </div>
      {unlocked && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: catColor, color: '#fff' }}
        >
          <Star size={10} />
        </div>
      )}
    </div>
  );
}

// ─── Cycle History Item ───
const CycleItem: React.FC<{ cycle: CycleRecord; index: number }> = ({ cycle, index }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(cycle.completedAt);
  const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className="rounded-[16px] overflow-hidden transition-all backdrop-blur-md"
      style={{
        background: expanded ? 'var(--glass-2)' : 'var(--glass-1)',
        border: '1px solid var(--glass-border)',
        boxShadow: expanded ? '0 10px 30px -10px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.02)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <span className="text-[11px] font-bold">#{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
            Цикл {index + 1}
          </div>
          <div className="text-[11px] font-mono" style={{ color: 'var(--ink3)' }}>
            {dateStr} · {cycle.cardCount} карт · avg {cycle.avgIntensity}%
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} style={{ color: 'var(--ink3)' }}>
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-2">
              <div className="h-px" style={{ background: 'var(--glass-2)' }} />
              {Object.entries(cycle.answers).map(([phaseId, answers]) => (
                <div key={phaseId}>
                  {Object.entries(answers).map(([key, val]) => (
                    <div key={key} className="py-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>
                        Фаза {phaseId} · {key}
                      </span>
                      <p className="text-[12px] font-serif italic mt-0.5" style={{ color: 'var(--ink2)' }}>
                        «{val}»
                      </p>
                    </div>
                  ))}
                </div>
              ))}
              {Object.keys(cycle.answers).length === 0 && (
                <p className="text-[12px]" style={{ color: 'var(--ink3)' }}>Нет сохранённых ответов</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════
// ─── MAIN PROFILE PAGE ───
// ═══════════════════════════════════════
export function ProfilePage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const {
    subscription, profile, completedCycles, streakData,
    achievements, savedCards, journalEntries,
    openPaywall, setSubscription, updateProfileName,
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<'stats' | 'achievements' | 'history' | 'settings' | 'neuro'>('neuro');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [neuronInsight, setNeuronInsight] = useState<string>('');

  const isPremium = subscription === 'premium';
  const features = TIER_CONFIG[subscription];

  const daysSinceJoin = Math.max(1, Math.floor(
    (Date.now() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const unlockedCount = achievements.length;
  const totalAchievements = ACHIEVEMENTS.filter(a => !a.premium || isPremium).length;

  const handleSaveName = () => {
    updateProfileName(nameInput.trim());
    setEditingName(false);
  };

  const handleLogout = () => {
    // Reset core user state
    useAppStore.setState({
      activePathId: null,
      activePathPhases: [],
      currentPhaseIndex: 0,
      highestUnlockedIndex: 0,
      answers: {},
      savedCards: [],
      removedIds: [],
      activeTab: 'feed',
      subscription: 'free',
      profile: {
        name: '',
        joinDate: new Date().toISOString(),
        avatarSeed: Math.floor(Math.random() * 10000),
      },
      completedCycles: [],
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        activeDays: [],
      },
      achievements: [],
      journalEntries: [],
      showPaywall: false,
    });
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const handleNeuronTap = async (neuron: Neuron) => {
    setNeuronInsight('Загрузка инсайта…');
    const days = Math.floor((Date.now() - new Date(neuron.bornAt).getTime()) / (1000 * 60 * 60 * 24));
    try {
      const response = await fetch('/api/neuro/neuron-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: neuron.bornAt,
          phaseName: PHASE_NAMES[neuron.phaseId] ?? `Фаза ${neuron.phaseId}`,
          phaseDesc: PHASE_NAMES[neuron.phaseId] ?? `Рефлексия ${neuron.phaseId}`,
          maturityLevel: neuron.maturityLevel,
          days,
        }),
      });
      const data = await response.json();
      setNeuronInsight(data.result || 'Нейрон интегрирован в гранулярный слой зубчатой извилины.');
    } catch {
      setNeuronInsight('Нейрон интегрирован в гранулярный слой зубчатой извилины.');
    }
  };

  // Generate exactly 1 neuron per completed cycle representing a clean developmental progression.
  const myNeurons: Neuron[] = useMemo(() => {
    return completedCycles.map((cycle, i) => {
      // Create a clean progression: older completed cycles are older neurons, newer is younger.
      // This spreads their developmental stages cleanly so they aren't all clustered too close in age.
      const actualAgeMs = Date.now() - new Date(cycle.completedAt).getTime();
      const minimumAgeMs = (completedCycles.length - 1 - i) * 7 * 24 * 60 * 60 * 1000; // 7 days per cycle
      const ageMs = Math.max(actualAgeMs, minimumAgeMs);
      const bornAtDate = new Date(Date.now() - ageMs);

      return {
        id: cycle.id,
        bornAt: bornAtDate.toISOString(),
        phaseId: i % PHASES.length,
        sessionContent: `Завершено: ${cycle.pathId === 'emergency' ? 'Экстренная помощь' : 'Терапевтический цикл'}`,
        maturityLevel: 0, // dynamic maturity is derived from bornAt inside the HippocampalView component
        x: 20 + (i / Math.max(completedCycles.length - 1, 1)) * 420,
        connections: [],
        intensity: cycle.avgIntensity,
      };
    });
  }, [completedCycles]);

  // Section tabs
  const TABS = [
    { id: 'neuro', label: 'Нейро', icon: <Brain size={14} /> },
    { id: 'stats', label: 'Обзор', icon: <Eye size={14} /> },
    { id: 'achievements', label: 'Достижения', icon: <Star size={14} /> },
    { id: 'history', label: 'История', icon: <RefreshCw size={14} /> },
    { id: 'settings', label: 'Настройки', icon: <Settings size={14} /> },
  ] as const;

  return (
    <div className="min-h-screen relative font-sans" style={{ backgroundColor: 'var(--surface)' }}>
      {/* Background atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(5%, 10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen"
          style={{ background: isPremium ? '#8E6F3E' : 'var(--accent)', opacity: 0.12, filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(-5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[40%] right-[-20%] w-[70vw] h-[70vw] rounded-full mix-blend-screen"
          style={{ background: 'var(--ink)', opacity: 0.05, filter: 'blur(100px)' }}
        />
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-40 backdrop-blur-2xl"
        style={{ background: 'var(--glass-1)', borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full transition-colors shrink-0"
            style={{ color: 'var(--ink2)', background: 'var(--sunken)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
              Личный кабинет
            </h1>
          </div>
          {isPremium && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, rgba(142,111,62,0.2) 0%, rgba(196,163,90,0.2) 100%)',
                border: '1px solid rgba(196,163,90,0.3)',
                color: '#C4A35A',
              }}
            >
              <Crown size={12} />
              Premium
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-6 pb-32 relative z-10">

        {/* ─── Avatar + Name ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div
            className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-4 relative transition-all"
            style={{
              background: isPremium
                ? 'linear-gradient(135deg, #8E6F3E 0%, #C4A35A 100%)'
                : 'var(--accent)',
              border: isPremium ? 'none' : '1px solid var(--glass-border)',
              boxShadow: isPremium
                ? '0 12px 24px -4px rgba(142,111,62,0.3)'
                : '0 15px 30px -5px rgba(26,54,40,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
            }}
          >
            <User size={32} color={'#fff'} />
          </div>

          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                placeholder="Ваше имя"
                className="text-center text-xl font-bold bg-transparent outline-none px-3 py-1 rounded-lg"
                style={{
                  color: 'var(--ink)',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-1)',
                }}
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setNameInput(profile.name);
                  setEditingName(true);
                }}
                className="text-xl font-bold transition-opacity hover:opacity-70"
                style={{ color: 'var(--ink)' }}
              >
                {profile.name || 'Нажмите, чтобы назвать себя'}
              </button>
              {profile.name && (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Выйти из профиля"
                  className="p-1.5 rounded-lg transition-all active:scale-95 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  style={{ color: 'var(--ink3)' }}
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          )}

          <p className="text-[11px] font-mono mt-1" style={{ color: 'var(--ink3)' }}>
            {daysSinceJoin} {daysSinceJoin === 1 ? 'день' : daysSinceJoin < 5 ? 'дня' : 'дней'} с нами
          </p>
        </motion.div>

        {/* ─── Section tabs ─── */}
        <div className="flex gap-1 p-1.5 rounded-[20px] mb-8 relative z-10 backdrop-blur-2xl" style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border-2)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.1)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-[14px] text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: activeSection === tab.id ? 'var(--accent)' : 'transparent',
                color: activeSection === tab.id ? '#fff' : 'var(--ink3)',
                boxShadow: activeSection === tab.id ? '0 10px 20px -5px var(--accent)' : 'none',
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── NEURO SECTION ─── */}
        <AnimatePresence mode="wait">
          {activeSection === 'neuro' && (
            <motion.div
              key="neuro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--ink3)' }}>
                    Дентатный гиппокамп
                  </div>
                  <h3 className="text-2xl font-serif italic leading-none" style={{ color: 'var(--ink)' }}>Нейрогенез</h3>
                </div>
                {myNeurons.length > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold font-serif" style={{ color: 'var(--accent-ink)' }}>
                      {myNeurons.length}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>
                      нейронов
                    </div>
                  </div>
                )}
              </div>
              <HippocampalView
                neurons={myNeurons}
                onNeuronTap={handleNeuronTap}
                phaseNames={PHASE_NAMES}
                insightText={neuronInsight}
              />
              {myNeurons.length > 0 ? (
                <p className="text-[11px] font-mono text-center" style={{ color: 'var(--ink3)' }}>
                  Нажмите на нейрон (зрелость ≥ 2) · Прокрутка для зума
                </p>
              ) : (
                <p className="text-[12px] text-center font-serif italic" style={{ color: 'var(--ink3)' }}>
                  Новые нейроны рождаются во время каждой рефлексии
                </p>
              )}

              {/* Neurogenesis Statistics */}
              {myNeurons.length > 0 && (() => {
                const avgAge = myNeurons.length > 0
                  ? myNeurons.reduce((sum, n) => {
                      const ageMs = Date.now() - new Date(n.bornAt).getTime();
                      return sum + Math.floor(ageMs / (1000 * 60 * 60 * 24));
                    }, 0) / myNeurons.length
                  : 0;

                const statsData: NeuronStatsData = {
                  total: myNeurons.length,
                  active: myNeurons.length,
                  integrated: Math.floor(myNeurons.length * 0.4),
                  dormant: 0,
                  avgAge: avgAge,
                };

                return <NeuronStats data={statsData} />;
              })()}
            </motion.div>
          )}

          {/* ─── STATS SECTION ─── */}
          {activeSection === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Циклов"
                  value={completedCycles.length}
                  icon={<RefreshCw size={14} />}
                  accent="#3B7A57"
                />
                <StatCard
                  label="Карт собрано"
                  value={savedCards.length}
                  icon={<Layers size={14} />}
                  accent="#2980B9"
                />
                <StatCard
                  label="Текущий стрик"
                  value={isPremium ? streakData.currentStreak : '—'}
                  icon={<Flame size={14} />}
                  accent={isPremium ? '#C4A35A' : 'var(--ink3)'}
                />
                <StatCard
                  label="Достижений"
                  value={`${unlockedCount}/${totalAchievements}`}
                  icon={<Star size={14} />}
                  accent="#6B5B95"
                />
              </div>

              {/* Heat map */}
              <div
                className="rounded-[24px] p-6 backdrop-blur-2xl transition-all"
                style={{
                  background: 'var(--glass-2)',
                  border: '1px solid var(--glass-border-2)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.15)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--ink3)' }}>
                    Активность (12 недель)
                  </span>
                  {isPremium && streakData.longestStreak > 0 && (
                    <span className="text-[10px] font-mono" style={{ color: '#C4A35A' }}>
                      Рекорд: {streakData.longestStreak}д
                    </span>
                  )}
                </div>
                {isPremium ? (
                  <HeatMap activeDays={streakData.activeDays} />
                ) : (
                  <button
                    onClick={() => openPaywall('feature')}
                    className="w-full py-6 rounded-xl flex flex-col items-center gap-2 transition-colors"
                    style={{ background: 'var(--glass-1)', border: '1px dashed var(--glass-border-2)' }}
                  >
                    <Lock size={20} style={{ color: 'var(--ink3)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--ink3)' }}>
                      Доступно в Premium
                    </span>
                  </button>
                )}
              </div>

              {/* Subscription CTA for free users */}
              {!isPremium && (
                <motion.button
                  onClick={() => openPaywall('profile')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 rounded-[16px] flex items-center gap-4 text-left relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(142,111,62,0.15) 0%, rgba(196,163,90,0.15) 100%)',
                    border: '1px solid rgba(196,163,90,0.25)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #8E6F3E, #C4A35A)' }}
                  >
                    <Crown size={20} color="#fff" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--ink)' }}>
                      Разблокировать Premium
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--ink2)' }}>
                      Все режимы, полная колода, AI-рефлексия
                    </div>
                  </div>
                  <div className="absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ─── ACHIEVEMENTS SECTION ─── */}
          {activeSection === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Progress bar */}
              <div
                className="rounded-[20px] p-5 backdrop-blur-md"
                style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border-2)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--ink3)' }}>
                    Прогресс
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--accent-ink)' }}>
                    {unlockedCount} из {totalAchievements}
                  </span>
                </div>
                <div className="h-[4px] rounded-full" style={{ background: 'var(--glass-2)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Grouped by category */}
              {(Object.keys(ACHIEVEMENT_CATEGORIES) as Array<keyof typeof ACHIEVEMENT_CATEGORIES>).map((catKey) => {
                const cat = ACHIEVEMENT_CATEGORIES[catKey];
                const catAchievements = ACHIEVEMENTS.filter(a => a.category === catKey);
                if (catAchievements.length === 0) return null;

                return (
                  <div key={catKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--ink3)' }}>
                        {cat.title}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {catAchievements.map(a => (
                        <AchievementItem
                          key={a.id}
                          achievement={a}
                          unlocked={achievements.includes(a.id)}
                          premium={a.premium}
                          isPremiumUser={isPremium}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ─── HISTORY SECTION ─── */}
          {activeSection === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {completedCycles.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw size={32} className="mx-auto mb-3" style={{ color: 'var(--ink3)', opacity: 0.4 }} />
                  <p className="text-[14px] font-serif italic mb-1" style={{ color: 'var(--ink2)' }}>
                    Ещё нет завершённых циклов
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--ink3)' }}>
                    Завершите первый маршрут, чтобы увидеть историю
                  </p>
                </div>
              ) : (
                <>
                  {!isPremium && completedCycles.length > 1 && (
                    <div
                      className="rounded-[14px] p-4 text-center"
                      style={{ background: 'rgba(142,111,62,0.1)', border: '1px solid rgba(196,163,90,0.2)' }}
                    >
                      <p className="text-[12px] mb-2" style={{ color: 'var(--ink2)' }}>
                        Бесплатный план показывает только последний цикл
                      </p>
                      <button
                        onClick={() => openPaywall('feature')}
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: '#C4A35A' }}
                      >
                        Открыть всю историю →
                      </button>
                    </div>
                  )}
                  {(isPremium ? completedCycles : completedCycles.slice(-1)).map((cycle, i) => (
                    <CycleItem key={cycle.id} cycle={cycle} index={isPremium ? i : completedCycles.length - 1} />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* ─── SETTINGS SECTION ─── */}
          {activeSection === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full p-4 rounded-[20px] flex items-center gap-4 text-left transition-all backdrop-blur-md"
                style={{
                  background: 'var(--glass-2)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                }}
              >
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--glass-2)' }}>
                  {isDark ? <Moon size={16} style={{ color: 'var(--ink)' }} /> : <Eye size={16} style={{ color: 'var(--ink)' }} />}
                </div>
                <div className="flex-1">
                  <span className="text-[13px] font-bold block" style={{ color: 'var(--ink)' }}>Тема</span>
                  <span className="text-[11px]" style={{ color: 'var(--ink3)' }}>{isDark ? 'Тёмная' : 'Светлая'}</span>
                </div>
                {!isPremium && isDark && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: 'rgba(196,163,90,0.15)', color: '#C4A35A' }}>
                    Premium
                  </span>
                )}
              </button>

              {/* Subscription status */}
              <div
                className="p-4 rounded-[20px] backdrop-blur-md"
                style={{
                  background: isPremium
                    ? 'linear-gradient(135deg, rgba(142,111,62,0.1), rgba(196,163,90,0.1))'
                    : 'var(--glass-2)',
                  border: `1px solid ${isPremium ? 'rgba(196,163,90,0.2)' : 'var(--glass-border)'}`,
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{
                      background: isPremium ? 'linear-gradient(135deg, #8E6F3E, #C4A35A)' : 'var(--glass-2)',
                    }}
                  >
                    <Crown size={16} color={isPremium ? '#fff' : 'var(--ink3)'} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[13px] font-bold block" style={{ color: 'var(--ink)' }}>
                      Подписка
                    </span>
                    <span className="text-[11px]" style={{ color: isPremium ? '#C4A35A' : 'var(--ink3)' }}>
                      {isPremium ? 'Premium активен' : 'Бесплатный план'}
                    </span>
                  </div>
                  {!isPremium ? (
                    <button
                      onClick={() => openPaywall('settings')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      Upgrade
                    </button>
                  ) : (
                    <button
                      onClick={() => setSubscription('free')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'var(--glass-2)', color: 'var(--ink3)', border: '1px solid var(--glass-border)' }}
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>

              {/* Limits info */}
              <div
                className="p-4 rounded-[20px] space-y-3 backdrop-blur-md"
                style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] block" style={{ color: 'var(--ink3)' }}>
                  Ваш план включает
                </span>
                {[
                  { label: 'Карт в колоде', value: features.maxCards === 79 ? 'Все 79' : `До ${features.maxCards}` },
                  { label: 'Интервенций', value: features.maxInterventionCards === 18 ? 'Все 18' : `${features.maxInterventionCards} из 18` },
                  { label: 'Режимы', value: isPremium ? 'Все 4' : 'Только Соло' },
                  { label: 'AI-рефлексия', value: features.hasAIReflection ? 'Да' : 'Нет' },
                  { label: 'PDF-экспорт', value: features.hasPdfExport ? 'Да' : 'Нет' },
                  { label: 'Инсайт-журнал', value: features.hasJournal ? 'Да' : 'Нет' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: 'var(--ink2)' }}>{item.label}</span>
                    <span className="text-[12px] font-bold" style={{ color: 'var(--ink)' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Data */}
              <div
                className="p-4 rounded-[20px] flex items-center gap-4 backdrop-blur-md"
                style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}
              >
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--glass-2)' }}>
                  <Calendar size={16} style={{ color: 'var(--ink)' }} />
                </div>
                <div className="flex-1">
                  <span className="text-[13px] font-bold block" style={{ color: 'var(--ink)' }}>
                    Данные
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--ink3)' }}>
                    Хранятся локально на устройстве
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] backdrop-blur-xl"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setShowLogoutConfirm(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed inset-x-4 top-[25vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[400px] z-[201] rounded-[28px] backdrop-blur-3xl p-6"
              style={{
                background: 'var(--glass-2)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
              }}
            >
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-[16px] mb-4 text-red-500"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <LogOut size={24} />
                </div>

                <h3 className="text-lg font-bold mb-2 text-[var(--ink)]" style={{ color: 'var(--ink)' }}>
                  Выйти из профиля?
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--ink2)' }}>
                  Все сохранённые нейроны, рефлексии и история прохождений будут удалены с этого устройства. Это действие необратимо.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: 'var(--glass-2)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--ink2)',
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-lg shadow-red-500/20 transition-all"
                  >
                    Да, выйти
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

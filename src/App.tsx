import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { ThemeProvider } from './context/ThemeContext';

import { BottomNav } from './components/BottomNav';
import { GearButton } from './components/GearButton';
import { PaywallModal } from './components/PaywallModal';
import { ProfileButton } from './components/ProfileButton';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Home, Map, Loader2 } from 'lucide-react';

const ModeSelection = lazy(() => import('./components/ModeSelection').then(m => ({ default: m.ModeSelection })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Gatekeeper = lazy(() => import('./components/Gatekeeper').then(m => ({ default: m.Gatekeeper })));
const SafetyPlan = lazy(() => import('./components/SafetyPlan').then(m => ({ default: m.SafetyPlan })));
const AntipodePhase = lazy(() => import('./components/AntipodePhase').then(m => ({ default: m.AntipodePhase })));
const InterventionPhase = lazy(() => import('./components/InterventionPhase').then(m => ({ default: m.InterventionPhase })));
const TransferApp = lazy(() => import('./TransferApp').then(m => ({ default: m.TransferApp })));

const FeedPage = lazy(() => import('./pages/FeedPage').then(m => ({ default: m.FeedPage })));
const DeckPage = lazy(() => import('./pages/DeckPage').then(m => ({ default: m.DeckPage })));

const SuspenseFallback = () => (
  <div className="flex-1 flex items-center justify-center p-8 h-full min-h-[300px]" style={{ color: 'var(--ink3)' }}>
    <Loader2 size={24} className="animate-spin" />
  </div>
);

export function CartographyAppContent() {
  const { activeTab, savedCards, currentPhaseIndex, activePathPhases, completePhase } = useAppStore();
  const navigate = useNavigate();
  const hasCards = savedCards.length > 0;
  
  const currentPhaseId = activePathPhases[currentPhaseIndex] || 0;

  const handleComplete = () => {
    completePhase(currentPhaseId, {});
    if (currentPhaseIndex >= activePathPhases.length - 1) {
      navigate('/safety-plan');
    } else {
      navigate('/dashboard');
    }
  };

  const dotColor = activeTab === 'deck'
    ? 'rgba(60,80,65,0.18)'
    : 'rgba(139,134,128,0.22)';

  return (
    <div className="h-full w-full max-w-[420px] mx-auto relative flex flex-col sm:shadow-[0_40px_100px_rgba(0,0,0,0.12)] sm:rounded-[36px] sm:border-[8px]" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--bezel)' }}>
      <button onClick={() => navigate('/dashboard')} className="absolute top-4 left-4 z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium backdrop-blur-md border shadow-sm">
        <Home size={14} /> <span>Карта</span>
      </button>

      <div className="flex-1 overflow-hidden relative sm:rounded-[28px]" style={{ backgroundColor: 'var(--sunken)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <AnimatePresence mode="wait">
          {activeTab === 'feed' ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 pb-32"
            >
              <Suspense fallback={<SuspenseFallback />}>
                <FeedPage />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="deck"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 pb-32"
            >
              <Suspense fallback={<SuspenseFallback />}>
                <DeckPage />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {hasCards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-[80px] left-0 right-0 px-6 z-20"
          >
            <button onClick={handleComplete} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white transition-all font-medium active:scale-[0.98]" style={{ background: 'var(--accent)', boxShadow: '0 8px 24px rgba(26,54,40,0.2)' }}>
              <Map size={16} /> <span>Завершить картографию</span> <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div className="h-[100dvh] w-full overflow-y-auto font-sans" style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)' }}>
        <GearButton variant="fixed" />
        <ProfileButton />
        <PaywallModal />
        
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/" element={<ModeSelection />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gatekeeper" element={<Gatekeeper />} />
            <Route path="/cartography" element={<CartographyAppContent />} />
            <Route path="/antipode" element={<AntipodePhase />} />
            <Route path="/intervention" element={<InterventionPhase />} />
            <Route path="/transfer" element={<TransferApp />} />
            <Route path="/safety-plan" element={<SafetyPlan />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

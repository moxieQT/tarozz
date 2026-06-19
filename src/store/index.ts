import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardType, SavedCardType } from '../types';
import { SubscriptionTier } from '../data/subscription';

export interface PhaseRecord {
  id: string;
  pathId: string;
  phaseIndex: number;
  completedAt: string; // ISO date
  answers: Record<string, string>;
  cardCount: number;
  avgIntensity: number;
}

export interface CycleRecord {
  id: string;
  pathId: string;
  completedAt: string; // ISO date
  answers: Record<number, Record<string, string>>;
  cardCount: number;
  avgIntensity: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  phaseId: number;
  content: string;
  mood: number; // 1-5
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeDays: string[]; // ISO date strings YYYY-MM-DD
}

interface UserProfile {
  name: string;
  joinDate: string;
  avatarSeed: number;
}

interface AppState {
  // Routing & progress
  activePathId: string | null;
  activePathPhases: number[];
  currentPhaseIndex: number;
  highestUnlockedIndex: number;
  answers: Record<number, Record<string, string>>;

  // Deck state
  savedCards: SavedCardType[];
  removedIds: string[];
  activeTab: 'feed' | 'deck';

  // === NEW: Subscription & Profile ===
  subscription: SubscriptionTier;
  profile: UserProfile;
  completedCycles: CycleRecord[];
  completedPhases: PhaseRecord[]; // 1 neuron per phase
  streakData: StreakData;
  achievements: string[];
  journalEntries: JournalEntry[];
  showPaywall: boolean;
  paywallTrigger: string;

  // Progress actions
  setPath: (pathId: string, phases: number[]) => void;
  setCurrentPhaseIndex: (index: number) => void;
  completePhase: (phaseId: number, answers: Record<string, string>) => void;
  resetAll: () => void;

  // Deck actions
  saveCard: (card: CardType, intensity: number) => void;
  removeCard: (cardId: string) => void;
  setActiveTab: (tab: 'feed' | 'deck') => void;

  // === NEW: Subscription actions ===
  setSubscription: (tier: SubscriptionTier) => void;
  openPaywall: (trigger: string) => void;
  closePaywall: () => void;

  // === NEW: Profile actions ===
  updateProfileName: (name: string) => void;

  // === NEW: Cycle & Phase history ===
  recordCycleCompletion: () => void;
  recordPhaseCompletion: (phaseIndex: number) => void;

  // === NEW: Streak ===
  recordActivity: () => void;

  // === NEW: Achievements ===
  unlockAchievement: (id: string) => void;
  checkAndUnlockAchievements: () => void;

  // === NEW: Journal ===
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function calculateStreak(activeDays: string[], today: string): { current: number; longest: number } {
  if (activeDays.length === 0) return { current: 0, longest: 0 };
  
  const sorted = [...new Set(activeDays)].sort().reverse();
  
  // Current streak: count consecutive days ending today or yesterday
  let current = 0;
  const todayDate = new Date(today);
  
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(todayDate);
    expected.setDate(expected.getDate() - i);
    const expectedISO = expected.toISOString().split('T')[0];
    
    if (sorted[i] === expectedISO) {
      current++;
    } else if (i === 0) {
      // Check if yesterday
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);
      if (sorted[i] === yesterday.toISOString().split('T')[0]) {
        current = 1;
        // Continue counting from yesterday
        for (let j = 1; j < sorted.length; j++) {
          const exp = new Date(yesterday);
          exp.setDate(exp.getDate() - j);
          if (sorted[j] === exp.toISOString().split('T')[0]) {
            current++;
          } else break;
        }
      }
      break;
    } else {
      break;
    }
  }
  
  // Longest streak
  let longest = 0;
  let tempStreak = 1;
  const allSorted = [...new Set(activeDays)].sort();
  for (let i = 1; i < allSorted.length; i++) {
    const prev = new Date(allSorted[i - 1]);
    const curr = new Date(allSorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
    } else {
      longest = Math.max(longest, tempStreak);
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak);
  
  return { current, longest };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Original state
      activePathId: null,
      activePathPhases: [],
      currentPhaseIndex: 0,
      highestUnlockedIndex: 0,
      answers: {},
      savedCards: [],
      removedIds: [],
      activeTab: 'feed',

      // New state
      subscription: 'free' as SubscriptionTier,
      profile: {
        name: '',
        joinDate: new Date().toISOString(),
        avatarSeed: Math.floor(Math.random() * 10000),
      },
      completedCycles: [],
      completedPhases: [],
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        activeDays: [],
      },
      achievements: [],
      journalEntries: [],
      showPaywall: false,
      paywallTrigger: '',

      // === Original methods ===
      setPath: (pathId, phases) => set({
        activePathId: pathId,
        activePathPhases: phases,
        currentPhaseIndex: 0,
        highestUnlockedIndex: 0,
      }),

      setCurrentPhaseIndex: (index) => set({ currentPhaseIndex: index }),

      completePhase: (phaseId, phaseAnswers) => set((state) => {
        const nextAnswers = { ...state.answers, [phaseId]: phaseAnswers };
        let nextHighest = state.highestUnlockedIndex;

        if (
          state.currentPhaseIndex === state.highestUnlockedIndex &&
          state.currentPhaseIndex < state.activePathPhases.length - 1
        ) {
          nextHighest++;
        }

        return { answers: nextAnswers, highestUnlockedIndex: nextHighest };
      }),

      resetAll: () => set((state) => ({
        activePathId: null,
        activePathPhases: [],
        currentPhaseIndex: 0,
        highestUnlockedIndex: 0,
        answers: {},
        savedCards: [],
        removedIds: [],
        activeTab: 'feed',
        // Preserve: subscription, profile, completedCycles, streakData, achievements, journal
      })),

      saveCard: (card, intensity) => {
        set((state) => ({
          savedCards: [...state.savedCards, { ...card, intensity }],
          removedIds: [...state.removedIds, card.id],
        }));
        // Auto-check achievements after saving card
        setTimeout(() => get().checkAndUnlockAchievements(), 100);
      },

      removeCard: (cardId) => set((state) => ({
        savedCards: state.savedCards.filter((c) => c.id !== cardId),
        removedIds: state.removedIds.filter((id) => id !== cardId),
      })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      // === Subscription methods ===
      setSubscription: (tier) => set({ subscription: tier, showPaywall: false }),

      openPaywall: (trigger) => set({ showPaywall: true, paywallTrigger: trigger }),

      closePaywall: () => set({ showPaywall: false }),

      // === Profile methods ===
      updateProfileName: (name) => set((state) => ({
        profile: { ...state.profile, name },
      })),

      // === Phase history (1 neuron per phase) ===
      recordPhaseCompletion: (phaseIndex: number) => set((state) => {
        // Prevent recording duplicate phases in the same second
        const now = new Date();
        const recentPhase = state.completedPhases[state.completedPhases.length - 1];
        if (recentPhase) {
          const timeSinceLastPhase = now.getTime() - new Date(recentPhase.completedAt).getTime();
          if (timeSinceLastPhase < 1000) {
            return {};
          }
        }

        const phase: PhaseRecord = {
          id: generateId(),
          pathId: state.activePathId || 'unknown',
          phaseIndex,
          completedAt: new Date().toISOString(),
          answers: state.answers[phaseIndex] || {},
          cardCount: state.savedCards.length,
          avgIntensity:
            state.savedCards.length > 0
              ? Math.round(
                  state.savedCards.reduce((s, c) => s + c.intensity, 0) /
                    state.savedCards.length
                )
              : 0,
        };
        return {
          completedPhases: [...state.completedPhases, phase],
        };
      }),

      // === Cycle history ===
      recordCycleCompletion: () => set((state) => {
        // Prevent recording duplicate cycles in the same second
        const now = new Date();
        const recentCycle = state.completedCycles[state.completedCycles.length - 1];
        if (recentCycle) {
          const timeSinceLastCycle = now.getTime() - new Date(recentCycle.completedAt).getTime();
          if (timeSinceLastCycle < 1000) {
            // Less than 1 second since last cycle — skip duplicate
            return {};
          }
        }

        const cycle: CycleRecord = {
          id: generateId(),
          pathId: state.activePathId || 'unknown',
          completedAt: new Date().toISOString(),
          answers: { ...state.answers },
          cardCount: state.savedCards.length,
          avgIntensity:
            state.savedCards.length > 0
              ? Math.round(
                  state.savedCards.reduce((s, c) => s + c.intensity, 0) /
                    state.savedCards.length
                )
              : 0,
        };
        return {
          completedCycles: [...state.completedCycles, cycle],
        };
      }),

      // === Streak ===
      recordActivity: () => set((state) => {
        const today = getTodayISO();
        const newDays = state.streakData.activeDays.includes(today)
          ? state.streakData.activeDays
          : [...state.streakData.activeDays, today];

        const { current, longest } = calculateStreak(newDays, today);

        return {
          streakData: {
            activeDays: newDays,
            lastActiveDate: today,
            currentStreak: current,
            longestStreak: Math.max(longest, state.streakData.longestStreak),
          },
        };
      }),

      // === Achievements ===
      unlockAchievement: (id) => set((state) => {
        if (state.achievements.includes(id)) return {};
        return { achievements: [...state.achievements, id] };
      }),

      checkAndUnlockAchievements: () => {
        const state = get();
        const unlock = (id: string) => {
          if (!state.achievements.includes(id)) {
            state.unlockAchievement(id);
          }
        };

        // First card
        if (state.savedCards.length >= 1) unlock('first_card');
        if (state.savedCards.length >= 10) unlock('collector_10');
        if (state.savedCards.length >= 30) unlock('collector_30');

        // High resonance
        if (state.savedCards.some((c) => c.intensity > 90)) unlock('high_resonance');

        // Phase-based
        if (state.answers[1]?.pattern) unlock('named_pattern');
        if (state.answers[4]) unlock('met_shadow');
        if (state.answers[5]?.action) unlock('new_choice');
        if (state.answers[7]?.resistance && state.answers[7]?.feedback) unlock('letter_to_self');

        // Cycles
        if (state.completedCycles.length >= 1) unlock('first_cycle');
        if (state.completedCycles.length >= 1) unlock('safety_plan');
        if (state.completedCycles.length >= 3) unlock('three_cycles');
        if (state.completedCycles.some((c) => c.pathId === 'full')) unlock('full_deep');

        // Streaks
        if (state.streakData.currentStreak >= 3) unlock('streak_3');
        if (state.streakData.currentStreak >= 7) unlock('streak_7');
        if (state.streakData.longestStreak >= 30) unlock('streak_30');
      },

      // === Journal ===
      addJournalEntry: (entry) => set((state) => ({
        journalEntries: [
          ...state.journalEntries,
          {
            ...entry,
            id: generateId(),
            date: new Date().toISOString(),
          },
        ],
      })),
    }),
    {
      name: 'tenth-phase-storage',
    }
  )
);

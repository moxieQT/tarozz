export type SubscriptionTier = 'free' | 'premium';

export interface TierFeatures {
  maxCards: number;
  maxInterventionCards: number;
  modes: string[];
  hasJournal: boolean;
  hasAudio: boolean;
  hasPdfExport: boolean;
  hasDarkTheme: boolean;
  hasStreaks: boolean;
  hasAchievements: boolean;
  hasFullHistory: boolean;
  hasTherapistExport: boolean;
}

export const TIER_CONFIG: Record<SubscriptionTier, TierFeatures> = {
  free: {
    maxCards: 10,
    maxInterventionCards: 6,
    // Crisis mode is always available — emergency support must never be paywalled.
    modes: ['solo', 'crisis'],
    hasJournal: false,
    hasAudio: false,
    hasPdfExport: false,
    hasDarkTheme: false,
    hasStreaks: false,
    hasAchievements: false,
    hasFullHistory: false,
    hasTherapistExport: false,
  },
  premium: {
    maxCards: 79,
    maxInterventionCards: 18,
    modes: ['solo', 'therapeutic', 'cbt', 'schema', 'full', 'crisis'],
    hasJournal: true,
    hasAudio: true,
    hasPdfExport: true,
    hasDarkTheme: true,
    hasStreaks: true,
    hasAchievements: true,
    hasFullHistory: true,
    hasTherapistExport: true,
  },
};

export interface PricingOption {
  id: string;
  label: string;
  price: string;
  priceSubtext: string;
  period: string;
  badge?: string;
  savings?: string;
}

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: 'monthly',
    label: 'Ежемесячно',
    price: '499 ₽',
    priceSubtext: '/ месяц',
    period: 'month',
  },
  {
    id: 'yearly',
    label: 'Ежегодно',
    price: '2 990 ₽',
    priceSubtext: '/ год',
    period: 'year',
    badge: 'Популярный',
    savings: '−50%',
  },
  {
    id: 'lifetime',
    label: 'Навсегда',
    price: '4 990 ₽',
    priceSubtext: 'единоразово',
    period: 'lifetime',
  },
];

export function canAccessMode(tier: SubscriptionTier, modeId: string): boolean {
  return TIER_CONFIG[tier].modes.includes(modeId);
}

export function getCardLimit(tier: SubscriptionTier): number {
  return TIER_CONFIG[tier].maxCards;
}

export function hasFeature(tier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const val = TIER_CONFIG[tier][feature];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  if (Array.isArray(val)) return val.length > 0;
  return false;
}

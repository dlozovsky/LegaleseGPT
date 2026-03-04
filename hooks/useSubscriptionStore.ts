import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Subscription tiers.
 * When RevenueCat is integrated, map entitlements to these tiers.
 */
export type SubscriptionTier = 'free' | 'premium';

interface SubscriptionState {
  tier: SubscriptionTier;
  isPremium: boolean;

  // Free tier limits
  freeScansPerDay: number;
  freeExportsPerDay: number;
  freeChatMessagesPerDay: number;

  // Usage tracking (resets daily)
  dailyScans: number;
  dailyExports: number;
  dailyChatMessages: number;
  lastResetDate: string; // ISO date string (YYYY-MM-DD)

  // Actions
  setPremium: (value: boolean) => void;
  incrementScans: () => void;
  incrementExports: () => void;
  incrementChatMessages: () => void;
  canScan: () => boolean;
  canExport: () => boolean;
  canChat: () => boolean;
  getRemainingScans: () => number;
  getRemainingExports: () => number;
  getRemainingChatMessages: () => number;
  resetDailyIfNeeded: () => void;

  /**
   * Restore purchases placeholder.
   * Replace with RevenueCat Purchases.restorePurchases() when integrated.
   */
  restorePurchases: () => Promise<void>;
}

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      isPremium: false,

      freeScansPerDay: 5,
      freeExportsPerDay: 2,
      freeChatMessagesPerDay: 10,

      dailyScans: 0,
      dailyExports: 0,
      dailyChatMessages: 0,
      lastResetDate: todayDateString(),

      setPremium: (value) =>
        set({
          isPremium: value,
          tier: value ? 'premium' : 'free',
        }),

      incrementScans: () => {
        get().resetDailyIfNeeded();
        set((state) => ({ dailyScans: state.dailyScans + 1 }));
      },

      incrementExports: () => {
        get().resetDailyIfNeeded();
        set((state) => ({ dailyExports: state.dailyExports + 1 }));
      },

      incrementChatMessages: () => {
        get().resetDailyIfNeeded();
        set((state) => ({ dailyChatMessages: state.dailyChatMessages + 1 }));
      },

      canScan: () => {
        const state = get();
        state.resetDailyIfNeeded();
        if (state.isPremium) return true;
        return state.dailyScans < state.freeScansPerDay;
      },

      canExport: () => {
        const state = get();
        state.resetDailyIfNeeded();
        if (state.isPremium) return true;
        return state.dailyExports < state.freeExportsPerDay;
      },

      canChat: () => {
        const state = get();
        state.resetDailyIfNeeded();
        if (state.isPremium) return true;
        return state.dailyChatMessages < state.freeChatMessagesPerDay;
      },

      getRemainingScans: () => {
        const state = get();
        if (state.isPremium) return Infinity;
        return Math.max(0, state.freeScansPerDay - state.dailyScans);
      },

      getRemainingExports: () => {
        const state = get();
        if (state.isPremium) return Infinity;
        return Math.max(0, state.freeExportsPerDay - state.dailyExports);
      },

      getRemainingChatMessages: () => {
        const state = get();
        if (state.isPremium) return Infinity;
        return Math.max(0, state.freeChatMessagesPerDay - state.dailyChatMessages);
      },

      resetDailyIfNeeded: () => {
        const today = todayDateString();
        const { lastResetDate } = get();
        if (lastResetDate !== today) {
          set({
            dailyScans: 0,
            dailyExports: 0,
            dailyChatMessages: 0,
            lastResetDate: today,
          });
        }
      },

      restorePurchases: async () => {
        // Placeholder: integrate RevenueCat Purchases.restorePurchases() here.
        // For now, this is a no-op.
        if (__DEV__) console.log('restorePurchases called – RevenueCat not yet integrated');
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

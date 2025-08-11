import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getClerkPublishableKey(): string | undefined {
  try {
    const envKey = (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined)
      ?? (Constants.expoConfig?.extra?.clerkPublishableKey as string | undefined);
    if (!envKey) return undefined;
    if (envKey === 'pk_test_your_actual_publishable_key_here') return undefined;
    if (!/^pk_(test|live)_/.test(envKey)) return undefined;
    return envKey;
  } catch (e) {
    return undefined;
  }
}

export function isClerkConfigured(): boolean {
  return Boolean(getClerkPublishableKey());
}

export function requireClerkExpo(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@clerk/clerk-expo');
    return mod;
  } catch (_err) {
    return null;
  }
}

export const tokenCache: {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
} = {
  getToken: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return null;
        const v = window.localStorage.getItem(key);
        return v ?? null;
      }
      const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
      const value = await SecureStore.getItemAsync(key);
      return value ?? null;
    } catch (e) {
      console.log('tokenCache.getToken error', e);
      return null;
    }
  },
  saveToken: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, value);
        return;
      }
      const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.log('tokenCache.saveToken error', e);
    }
  },
};

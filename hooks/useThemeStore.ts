import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPPORTED_OUTPUT_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Chinese',
] as const;

export type OutputLanguage = (typeof SUPPORTED_OUTPUT_LANGUAGES)[number];

interface ThemeState {
  isDarkMode: boolean;
  highContrast: boolean;
  textToSpeech: boolean;
  fontSize: 'small' | 'medium' | 'large';
  saveHistory: boolean;
  defaultSimplificationLevel: number;
  hasOnboarded: boolean;
  outputLanguage: OutputLanguage;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  toggleTextToSpeech: () => void;
  toggleSaveHistory: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setDefaultSimplificationLevel: (level: number) => void;
  setHasOnboarded: (value: boolean) => void;
  setOutputLanguage: (lang: OutputLanguage) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      highContrast: false,
      textToSpeech: true,
      fontSize: 'medium',
      saveHistory: true,
      defaultSimplificationLevel: 1,
      hasOnboarded: false,
      outputLanguage: 'English',
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      toggleTextToSpeech: () => set((state) => ({ textToSpeech: !state.textToSpeech })),
      toggleSaveHistory: () => set((state) => ({ saveHistory: !state.saveHistory })),
      setFontSize: (fontSize) => set({ fontSize }),
      setDefaultSimplificationLevel: (level) => set({ defaultSimplificationLevel: level }),
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      setOutputLanguage: (lang) => set({ outputLanguage: lang }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
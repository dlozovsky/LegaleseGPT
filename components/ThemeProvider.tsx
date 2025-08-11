import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/hooks/useThemeStore';
import colors from '@/constants/colors';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: {
    primary: string;
    background: string;
    secondary: string;
    text: string;
    textLight: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  highContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const { isDarkMode: userPrefersDark, highContrast } = useThemeStore();
  
  // Determine if dark mode should be active based on user preference or system
  const isDarkMode = userPrefersDark || systemColorScheme === 'dark';
  
  // Select the appropriate color palette based on theme
  const themeColors = isDarkMode ? {
    primary: colors.darkPrimary,
    background: colors.darkBackground,
    secondary: colors.darkSecondary,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    border: colors.darkBorder,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
  } : {
    primary: colors.primary,
    background: colors.background,
    secondary: colors.secondary,
    text: colors.text,
    textLight: colors.textLight,
    border: colors.border,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
  };
  
  // Apply high contrast modifications if needed
  const finalColors = highContrast ? {
    ...themeColors,
    // Increase contrast for high contrast mode
    textLight: isDarkMode ? '#FFFFFF' : '#000000',
    border: isDarkMode ? '#FFFFFF' : '#000000',
    // Ensure primary color has sufficient contrast
    primary: isDarkMode ? '#A5B4FC' : '#4338CA',
  } : themeColors;
  
  const value = {
    isDarkMode,
    colors: finalColors,
    highContrast,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
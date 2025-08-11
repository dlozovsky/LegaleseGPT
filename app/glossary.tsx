import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useThemeStore } from '@/hooks/useThemeStore';
import colors from '@/constants/colors';
import AiGlossary from '@/components/AiGlossary';

export default function GlossaryScreen() {
  const { isDarkMode } = useThemeStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? colors.darkBackground : colors.background }}>
      <Stack.Screen 
        options={{ 
          title: "AI Legal Glossary",
          headerStyle: {
            backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary,
          },
          headerTintColor: 'white',
        }} 
      />
      <AiGlossary onClose={() => router.back()} />
    </SafeAreaView>
  );
}
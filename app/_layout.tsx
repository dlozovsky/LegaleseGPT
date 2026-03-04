import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ErrorBoundary } from '@/app/error-boundary';
import { getClerkProvider, tokenCache } from '@/utils/clerkHelpers';
import React from "react";

const clerkConfig = getClerkProvider();

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="upload" options={{ title: 'Upload Document' }} />
        <Stack.Screen name="paste" options={{ title: 'Paste Text' }} />
        <Stack.Screen name="camera" options={{ title: 'Scan Document' }} />
        <Stack.Screen name="disclaimer" options={{ title: 'Disclaimer' }} />
        <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="results/[id]" options={{ title: 'Results' }} />
        <Stack.Screen name="glossary" options={{ title: 'Glossary' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  if (clerkConfig.available && 'ClerkProvider' in clerkConfig) {
    const Provider = (clerkConfig as any).ClerkProvider as React.ComponentType<any>;
    return (
      <ErrorBoundary>
        <Provider publishableKey={(clerkConfig as any).publishableKey} tokenCache={tokenCache}>
          <RootLayoutContent />
        </Provider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}
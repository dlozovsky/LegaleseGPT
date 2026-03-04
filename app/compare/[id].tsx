import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, ArrowLeftRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import Button from '@/components/Button';

type ViewMode = 'side-by-side' | 'toggle';

export default function CompareScreen() {
  const { id } = useLocalSearchParams();
  const { isDarkMode, fontSize } = useThemeStore();
  const { getDocument } = useDocumentStore();
  const [viewMode, setViewMode] = useState<ViewMode>(
    Platform.OS === 'web' ? 'side-by-side' : 'toggle'
  );
  const [activePanel, setActivePanel] = useState<'original' | 'simplified'>('simplified');

  const document = getDocument(id as string);

  const themeColors = isDarkMode
    ? {
        background: colors.darkBackground,
        text: colors.darkText,
        textLight: colors.darkTextLight,
        card: colors.darkSecondary,
        border: colors.darkBorder,
        originalBg: colors.darkBackground,
        simplifiedBg: colors.darkSecondary,
      }
    : {
        background: colors.background,
        text: colors.text,
        textLight: colors.textLight,
        card: 'white',
        border: colors.border,
        originalBg: '#FFF8F0',
        simplifiedBg: '#F0FFF4',
      };

  const getFontSize = () => {
    switch (fontSize) {
      case 'small': return 13;
      case 'large': return 17;
      default: return 15;
    }
  };

  if (!document) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Compare' }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.text }]}>Document not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const renderSideBySide = () => (
    <View style={styles.sideBySide}>
      <View style={[styles.panel, { borderColor: themeColors.border }]}>
        <View style={[styles.panelHeader, { backgroundColor: themeColors.originalBg, borderColor: themeColors.border }]}>
          <Text style={[styles.panelTitle, { color: themeColors.text }]}>Original</Text>
        </View>
        <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.panelText, { color: themeColors.text, fontSize: getFontSize() }]}>
            {document.text}
          </Text>
        </ScrollView>
      </View>

      <View style={[styles.panel, { borderColor: themeColors.border }]}>
        <View style={[styles.panelHeader, { backgroundColor: themeColors.simplifiedBg, borderColor: themeColors.border }]}>
          <Text style={[styles.panelTitle, { color: themeColors.text }]}>Simplified</Text>
        </View>
        <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.panelText, { color: themeColors.text, fontSize: getFontSize() }]}>
            {document.simplified}
          </Text>
        </ScrollView>
      </View>
    </View>
  );

  const renderToggle = () => (
    <View style={styles.toggleContainer}>
      {/* Toggle buttons */}
      <View style={[styles.toggleButtons, { borderColor: themeColors.border }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activePanel === 'original' && { backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary },
          ]}
          onPress={() => setActivePanel('original')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              { color: activePanel === 'original' ? 'white' : themeColors.textLight },
            ]}
          >
            Original
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activePanel === 'simplified' && { backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary },
          ]}
          onPress={() => setActivePanel('simplified')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              { color: activePanel === 'simplified' ? 'white' : themeColors.textLight },
            ]}
          >
            Simplified
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.toggleContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.panelText, { color: themeColors.text, fontSize: getFontSize() }]}>
          {activePanel === 'original' ? document.text : document.simplified}
        </Text>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Compare',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={isDarkMode ? colors.darkText : colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'side-by-side' ? 'toggle' : 'side-by-side')}
              style={styles.modeButton}
            >
              <ArrowLeftRight size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Document title */}
      <View style={[styles.titleBar, { borderColor: themeColors.border }]}>
        <Text style={[styles.documentTitle, { color: themeColors.text }]} numberOfLines={1}>
          {document.title}
        </Text>
      </View>

      {viewMode === 'side-by-side' ? renderSideBySide() : renderToggle()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: 8, marginLeft: -8 },
  modeButton: { padding: 8 },
  titleBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  documentTitle: { fontSize: 15, fontWeight: '600' },
  // Side-by-side
  sideBySide: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    flex: 1,
    borderRightWidth: 1,
  },
  panelHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  panelTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  panelContent: { flex: 1 },
  panelText: { padding: 12, lineHeight: 22 },
  // Toggle
  toggleContainer: { flex: 1 },
  toggleButtons: {
    flexDirection: 'row',
    margin: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleButtonText: { fontSize: 14, fontWeight: '600' },
  toggleContent: { flex: 1 },
  // Error
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, marginBottom: 20 },
});

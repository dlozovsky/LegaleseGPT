import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Heart, Share2, Download, ChevronLeft, Sparkles, MessageCircle, ArrowLeftRight, Calendar, Crown } from 'lucide-react-native';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useSubscriptionStore } from '@/hooks/useSubscriptionStore';
import { exportDocument } from '@/utils/exportService';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import TextDisplay from '@/components/TextDisplay';
import ContractOverview from '@/components/ContractOverview';
import SectionCard from '@/components/SectionCard';

// Update TabType to include 'analysis'
type TabType = 'simplified' | 'original' | 'analysis';

// Define the tab item type with proper icon type
interface TabItem {
  key: TabType;
  label: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const { getDocument, toggleFavorite, saved } = useDocumentStore();
  const { canExport, incrementExports, isPremium } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState<TabType>('simplified');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  
  const document = getDocument(id as string);
  const isFavorited = saved.some(doc => doc.id === document?.id);
  
  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    card: colors.darkSecondary,
    border: colors.darkBorder,
    tabActive: colors.darkPrimary,
    tabInactive: colors.darkTextLight,
  } : {
    background: colors.background,
    text: colors.text,
    textLight: colors.textLight,
    card: 'white',
    border: colors.border,
    tabActive: colors.primary,
    tabInactive: colors.textLight,
  };

  if (!document) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Document Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.text }]}>
            Document not found
          </Text>
          <Button 
            title="Go Back" 
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      const content = activeTab === 'original' ? document.text : document.simplified;
      await Share.share({
        message: `${document.title}

${content}`,
        title: document.title,
      });
    } catch (error) {
      if (__DEV__) console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    toggleFavorite(document);
  };

  const handleExport = async () => {
    if (!canExport()) {
      router.push('/paywall');
      return;
    }
    setIsExporting(true);
    try {
      await exportDocument(document);
      incrementExports();
    } catch (error) {
      Alert.alert('Export Error', error instanceof Error ? error.message : 'Failed to export document.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleChat = () => {
    router.push(`/chat/${document.id}`);
  };

  const handleCompare = () => {
    router.push(`/compare/${document.id}`);
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const tabs: TabItem[] = [
    { key: 'simplified', label: 'Simplified' },
    { key: 'original', label: 'Original' },
  ];

  // Add analysis tab if AI analysis is available
  if (document.hasAiAnalysis && document.aiAnalysis) {
    tabs.push({ key: 'analysis', label: 'AI Analysis', icon: Sparkles });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: document.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={isDarkMode ? colors.darkText : colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleFavorite} style={styles.headerAction}>
                <Heart 
                  size={24} 
                  color={isFavorited ? colors.error : (isDarkMode ? colors.darkTextLight : colors.textLight)}
                  fill={isFavorited ? colors.error : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
                <Share2 size={24} color={isDarkMode ? colors.darkTextLight : colors.textLight} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { borderBottomColor: themeColors.tabActive }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={styles.tabContent}>
                {tab.icon && (
                  <tab.icon
                    size={16}
                    color={activeTab === tab.key ? themeColors.tabActive : themeColors.tabInactive}
                  />
                )}
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? themeColors.tabActive : themeColors.tabInactive }
                ]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Info */}
        <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.documentTitle, { color: themeColors.text }]}>
            {document.title}
          </Text>
          <Text style={[styles.documentDate, { color: themeColors.textLight }]}>
            Processed on {document.date}
          </Text>
          {document.hasAiAnalysis && (
            <View style={styles.aiIndicator}>
              <Sparkles size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} />
              <Text style={[styles.aiIndicatorText, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>
                AI Analysis Available
              </Text>
            </View>
          )}
        </View>

        {/* Content based on active tab */}
        {activeTab === 'simplified' && (
          <TextDisplay 
            title="Simplified Version"
            content={document.simplified}
          />
        )}

        {activeTab === 'original' && (
          <TextDisplay 
            title="Original Text"
            content={document.text}
          />
        )}

        {activeTab === 'analysis' && document.aiAnalysis && (
          <View style={styles.analysisContainer}>
            <ContractOverview analysis={document.aiAnalysis} />

            {/* Key Dates */}
            {document.keyDates && document.keyDates.length > 0 && (
              <View style={[styles.keyDatesContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={styles.keyDatesHeader}>
                  <Calendar size={18} color={isDarkMode ? colors.darkPrimary : colors.primary} />
                  <Text style={[styles.keyDatesTitle, { color: themeColors.text }]}>Key Dates & Deadlines</Text>
                </View>
                {document.keyDates.map((kd, i) => (
                  <View key={i} style={[styles.keyDateRow, { borderColor: themeColors.border }]}>
                    <Text style={[styles.keyDateLabel, { color: themeColors.text }]}>{kd.label}</Text>
                    <Text style={[styles.keyDateValue, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>{kd.date}</Text>
                    {kd.description && (
                      <Text style={[styles.keyDateDesc, { color: themeColors.textLight }]}>{kd.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.sectionsContainer}>
              <Text style={[styles.sectionsTitle, { color: themeColors.text }]}>
                Section Analysis
              </Text>
              {document.aiAnalysis.sections.map((section, index) => (
                <SectionCard
                  key={index}
                  section={section}
                  isExpanded={expandedSections.has(index)}
                  onToggle={() => toggleSection(index)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick action bar */}
        <View style={[styles.quickActions, { borderColor: themeColors.border }]}>
          <TouchableOpacity style={styles.quickAction} onPress={handleChat}>
            <MessageCircle size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleCompare}>
            <ArrowLeftRight size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleExport} disabled={isExporting}>
            <Download size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} />
            <Text style={[styles.quickActionText, { color: themeColors.text }]}>{isExporting ? 'Exporting...' : 'Export'}</Text>
          </TouchableOpacity>
          {!isPremium && (
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/paywall')}>
              <Crown size={20} color={colors.warning} />
              <Text style={[styles.quickActionText, { color: colors.warning }]}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button 
            title="Share Document" 
            variant="outline"
            onPress={handleShare}
            style={styles.actionButton}
          />
          <Button 
            title={isFavorited ? "Remove from Saved" : "Save Document"}
            variant={isFavorited ? "outline" : "primary"}
            onPress={handleFavorite}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  tabContainer: {
    borderBottomWidth: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysisContainer: {
    gap: 20,
  },
  sectionsContainer: {
    gap: 12,
  },
  sectionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  quickAction: {
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  keyDatesContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  keyDatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  keyDatesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  keyDateRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  keyDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  keyDateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  keyDateDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    marginTop: 20,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
  },
  actionButton: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    paddingHorizontal: 32,
  },
});
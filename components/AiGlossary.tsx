import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Search, Sparkles, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { callAPI } from '@/utils/aiService';

interface AiGlossaryProps {
  contractText?: string;
  onClose: () => void;
}

interface GlossaryEntry {
  term: string;
  definition: string;
  context?: string;
}

export default function AiGlossary({ contractText, onClose }: AiGlossaryProps) {
  const { isDarkMode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDefinition, setCurrentDefinition] = useState<GlossaryEntry | null>(null);
  const [searchHistory, setSearchHistory] = useState<GlossaryEntry[]>([]);
  
  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    card: colors.darkSecondary,
    border: colors.darkBorder,
    input: colors.darkSecondary,
  } : {
    background: colors.background,
    text: colors.text,
    textLight: colors.textLight,
    card: 'white',
    border: colors.border,
    input: colors.secondary,
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setCurrentDefinition(null);
    
    try {
      const messages = [
        {
          role: 'system',
          content: `You are a legal expert who explains legal terms in simple, everyday language. 
          ${contractText ? 'Use the provided contract context to give specific explanations.' : 'Provide general legal definitions.'}
          Keep explanations under 100 words and use plain English.`
        },
        {
          role: 'user',
          content: `Explain the legal term or phrase: "${searchQuery}"
          ${contractText ? `
          
          Contract context:
          ${contractText.substring(0, 1000)}...` : ''}`
        }
      ];
      
      const definition = await callAPI(messages);
      
      const entry: GlossaryEntry = {
        term: searchQuery,
        definition: definition.trim(),
        context: contractText ? 'From your contract' : 'General definition'
      };
      
      setCurrentDefinition(entry);
      
      // Add to search history (avoid duplicates)
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.term.toLowerCase() !== searchQuery.toLowerCase());
        return [entry, ...filtered].slice(0, 10); // Keep last 10 searches
      });
      
    } catch (error) {
      if (__DEV__) console.error('Error getting AI definition:', error);
      setCurrentDefinition({
        term: searchQuery,
        definition: 'Sorry, I could not provide a definition at this time. Please try again or consult a legal professional.',
        context: 'Error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (entry: GlossaryEntry) => {
    setSearchQuery(entry.term);
    setCurrentDefinition(entry);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <View style={styles.headerLeft}>
          <Sparkles size={24} color={isDarkMode ? colors.darkPrimary : colors.primary} />
          <Text style={[styles.title, { color: themeColors.text }]}>
            AI Legal Glossary
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={themeColors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.input, borderColor: themeColors.border }]}>
          <Search size={20} color={themeColors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Ask about any legal term..."
            placeholderTextColor={themeColors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            onPress={handleSearch}
            style={[styles.searchButton, { backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary }]}
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.searchButtonText}>Ask AI</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Definition */}
        {currentDefinition && (
          <View style={[styles.definitionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.definitionHeader}>
              <Text style={[styles.termTitle, { color: themeColors.text }]}>
                {currentDefinition.term}
              </Text>
              {currentDefinition.context && (
                <Text style={[styles.contextLabel, { color: themeColors.textLight }]}>
                  {currentDefinition.context}
                </Text>
              )}
            </View>
            <Text style={[styles.definition, { color: themeColors.text }]}>
              {currentDefinition.definition}
            </Text>
          </View>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={[styles.historyTitle, { color: themeColors.text }]}>
              Recent Searches
            </Text>
            {searchHistory.map((entry, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.historyItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => handleHistorySelect(entry)}
              >
                <Text style={[styles.historyTerm, { color: themeColors.text }]}>
                  {entry.term}
                </Text>
                <Text style={[styles.historyDefinition, { color: themeColors.textLight }]} numberOfLines={2}>
                  {entry.definition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Help Text */}
        <View style={[styles.helpCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.helpTitle, { color: themeColors.text }]}>
            How to use AI Glossary
          </Text>
          <Text style={[styles.helpText, { color: themeColors.textLight }]}>
            • Type any legal term or phrase{'\n'}
            • Get context-aware explanations{'\n'}
            • Definitions are tailored to your contract{'\n'}
            • Ask follow-up questions for clarity
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  definitionCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  definitionHeader: {
    marginBottom: 12,
  },
  termTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contextLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  definition: {
    fontSize: 16,
    lineHeight: 24,
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyTerm: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDefinition: {
    fontSize: 13,
    lineHeight: 18,
  },
  helpCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
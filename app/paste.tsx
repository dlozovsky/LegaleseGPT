import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { simplifyText, getRateLimitStatus, detectLanguage } from '@/utils/aiService';
import { generateDocumentTitle } from '@/utils/documentUtils';
import Button from '@/components/Button';
import Header from '@/components/Header';
import colors from '@/constants/colors';
import ErrorMessage from '@/components/ErrorMessage';
import RateLimitInfo from '@/components/RateLimitInfo';
import { isDocumentTooLarge } from '@/utils/documentProcessing';

export default function PasteScreen() {
  const { isDarkMode, outputLanguage } = useThemeStore();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState({
    scansToday: 0,
    maxScansPerDay: 5,
    scansThisMinute: 0,
    maxScansPerMinute: 1,
  });
  const { addToHistory } = useDocumentStore();

  // Load rate limit status
  useEffect(() => {
    const loadRateLimitStatus = async () => {
      try {
        const status = await getRateLimitStatus();
        setRateLimitStatus(status);
      } catch (error) {
        if (__DEV__) console.error('Error loading rate limit status:', error);
      }
    };
    
    loadRateLimitStatus();
    
    // Refresh rate limit status every 30 seconds
    const interval = setInterval(loadRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const processText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to simplify');
      return;
    }

    // Check rate limits before processing
    const currentStatus = await getRateLimitStatus();
    if (currentStatus.scansToday >= currentStatus.maxScansPerDay) {
      setError("You've used your 5 free scans today.");
      return;
    }

    if (currentStatus.scansThisMinute >= currentStatus.maxScansPerMinute) {
      setError("Try again in a moment.");
      return;
    }

    // Check if document is too large
    if (isDocumentTooLarge(text)) {
      setError('The text is too large to process. Please enter a shorter document (fewer than 15 pages).');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Detect language
      const detectedLanguage = await detectLanguage(text);

      // Simplify the text (this will also validate if it's a legal document)
      const simplifiedText = await simplifyText(text, 1, outputLanguage);
      
      if (!simplifiedText || simplifiedText.trim().length === 0) {
        throw new Error('Text simplification failed. Please try again with different text.');
      }
      
      // Generate a title
      const title = await generateDocumentTitle(text);
      
      // Create a new document
      const newDocument = {
        id: Date.now(),
        title,
        date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
        text: text,
        simplified: simplifiedText,
        detectedLanguage,
      };
      
      // Add to store
      addToHistory(newDocument);
      
      // Update rate limit status
      const updatedStatus = await getRateLimitStatus();
      setRateLimitStatus(updatedStatus);
      
      // Navigate to results
      router.push(`/results/${newDocument.id}`);
    } catch (error) {
      if (__DEV__) console.error('Error processing text:', error);
      setError(error instanceof Error ? error.message : 'Text processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = text.trim() && 
                    rateLimitStatus.scansToday < rateLimitStatus.maxScansPerDay && 
                    rateLimitStatus.scansThisMinute < rateLimitStatus.maxScansPerMinute;

  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    card: colors.darkSecondary,
    border: colors.darkBorder,
  } : {
    background: colors.background,
    text: colors.text,
    card: 'white',
    border: colors.border,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          title="Paste Legal Text"
          subtitle="Paste your legal text below to simplify it into plain language."
        />

        <RateLimitInfo 
          scansToday={rateLimitStatus.scansToday} 
          maxScansPerDay={rateLimitStatus.maxScansPerDay}
          scansThisMinute={rateLimitStatus.scansThisMinute}
          maxScansPerMinute={rateLimitStatus.maxScansPerMinute}
        />

        <View style={[styles.textAreaContainer, { borderColor: themeColors.border, backgroundColor: themeColors.card }]}>
          <TextInput
            style={[styles.textArea, { color: themeColors.text }]}
            multiline
            placeholder="Paste your legal text here..."
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (error) setError(null); // Clear error when user types
            }}
            textAlignVertical="top"
          />
        </View>

        {error && <ErrorMessage message={error} />}

        <View style={styles.actions}>
          <Button 
            title="Simplify" 
            onPress={processText}
            loading={isProcessing}
            disabled={!canProcess || isProcessing}
            style={styles.button}
          />
          <Button 
            title="Cancel" 
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 300,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
});
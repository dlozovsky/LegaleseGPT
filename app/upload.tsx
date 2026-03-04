import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDocumentStore, EnhancedDocumentItem } from '@/hooks/useDocumentStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { extractTextFromPDF, extractTextFromWord, extractTextFromTextFile, isDocumentTooLarge } from '@/utils/documentProcessing';
import { simplifyText, getRateLimitStatus, analyzeContract, detectLanguage } from '@/utils/aiService';
import { generateDocumentTitle } from '@/utils/documentUtils';
import { extractTextFromImage } from '@/utils/ocrService';
import FileUploader from '@/components/FileUploader';
import Button from '@/components/Button';
import Header from '@/components/Header';
import ErrorMessage from '@/components/ErrorMessage';
import RateLimitInfo from '@/components/RateLimitInfo';
import colors from '@/constants/colors';

export default function UploadScreen() {
  const { isDarkMode, outputLanguage } = useThemeStore();
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useAiAnalysis, setUseAiAnalysis] = useState(true);
  const [rateLimitStatus, setRateLimitStatus] = useState({
    scansToday: 0,
    maxScansPerDay: 5,
    scansThisMinute: 0,
    maxScansPerMinute: 1,
  });
  const { addToHistory, updateDocumentWithAI } = useDocumentStore();
  
  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    card: colors.darkSecondary,
    border: colors.darkBorder,
  } : {
    background: colors.background,
    text: colors.text,
    textLight: colors.textLight,
    card: 'white',
    border: colors.border,
  };

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

  const handleFileSelected = (uri: string, name: string, type: string) => {
    if (__DEV__) console.log('File selected:', { uri, name, type });
    setFileUri(uri);
    setFileName(name);
    setFileType(type);
    setError(null); // Clear any previous errors
  };

  const updateProgress = (status: string, progress: number) => {
    setProcessingStatus(status);
    setProcessingProgress(progress);
  };

  const processDocument = async () => {
    if (!fileUri) {
      setError('Please select a file first');
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

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    updateProgress('Starting document processing...', 10);

    try {
      if (__DEV__) console.log('Processing document:', fileUri, 'type:', fileType);
      
      // Extract text based on file type
      let extractedText = '';
      let simplifiedText = '';
      
      if (fileType === 'image') {
        updateProgress('Performing OCR and analysis...', 30);
        if (__DEV__) console.log('Extracting and simplifying text from image');
        try {
          const result = await extractTextFromImage(fileUri);
          extractedText = result.originalText;
          simplifiedText = result.simplifiedText;
          updateProgress('OCR completed successfully', 50);
        } catch (ocrError) {
          if (__DEV__) console.error('OCR error:', ocrError);
          throw new Error(ocrError instanceof Error ? ocrError.message : 'Text extraction failed. Please try again with a clearer image or better lighting.');
        }
      } else {
        // For non-image files, extract text first, then simplify
        if (fileType === 'pdf') {
          updateProgress('Extracting text from PDF...', 30);
          if (__DEV__) console.log('Extracting text from PDF');
          try {
            extractedText = await extractTextFromPDF(fileUri);
          } catch (pdfError) {
            if (__DEV__) console.error('PDF extraction error:', pdfError);
            if (pdfError instanceof Error) {
              throw pdfError;
            } else {
              throw new Error('Failed to extract text from PDF. The file may be encrypted, scanned, or in an unsupported format.');
            }
          }
        } else if (fileType === 'docx' || fileType === 'doc') {
          updateProgress(`Extracting text from ${fileType.toUpperCase()} document...`, 30);
          if (__DEV__) console.log(`Extracting text from ${fileType} document`);
          try {
            extractedText = await extractTextFromWord(fileUri, fileType);
          } catch (docError) {
            if (__DEV__) console.error('Document extraction error:', docError);
            if (docError instanceof Error) {
              throw docError;
            } else {
              throw new Error(`Failed to extract text from ${fileType.toUpperCase()} file. The file may be in an unsupported format.`);
            }
          }
        } else if (fileType === 'text' || fileUri.endsWith('.txt')) {
          updateProgress('Reading text file...', 30);
          if (__DEV__) console.log('Reading text file');
          try {
            extractedText = await extractTextFromTextFile(fileUri);
          } catch (textError) {
            if (__DEV__) console.error('Text file reading error:', textError);
            throw new Error(textError instanceof Error ? textError.message : 'Failed to read text file. The file may be corrupted or in an unsupported format.');
          }
        } else {
          throw new Error('Unsupported file type. Please upload a JPG, PNG, PDF, DOC, DOCX, or TXT file, or paste text directly.');
        }
        
        updateProgress('Text extraction completed', 50);
        if (__DEV__) console.log('Extracted text:', extractedText?.substring(0, 100) + '...');
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text was extracted. The file may be empty or in an unsupported format.');
        }
        
        // Simplify the text using AI
        updateProgress('AI is analyzing and simplifying text...', 70);
        if (__DEV__) console.log('Simplifying text');
        
        try {
          simplifiedText = await simplifyText(extractedText);
          if (__DEV__) console.log('Simplified text:', simplifiedText?.substring(0, 100) + '...');
        } catch (simplifyError) {
          if (__DEV__) console.error('Simplification error:', simplifyError);
          throw new Error(simplifyError instanceof Error ? simplifyError.message : 'Text simplification failed. Please try again.');
        }
      }
      
      // Detect language
      updateProgress('Detecting language...', 82);
      let detectedLanguage = 'English';
      try {
        detectedLanguage = await detectLanguage(extractedText);
      } catch {
        if (__DEV__) console.log('Language detection failed, defaulting to English');
      }

      // Generate a title
      updateProgress('Generating document title...', 85);
      if (__DEV__) console.log('Generating title');
      
      let title;
      try {
        title = fileName || await generateDocumentTitle(extractedText);
        if (__DEV__) console.log('Generated title:', title);
      } catch (titleError) {
        if (__DEV__) console.error('Title generation error:', titleError);
        title = fileName || "Uploaded Document";
      }
      
      // Create a new document with proper typing
      const newDocument: EnhancedDocumentItem = {
        id: Date.now(),
        title,
        date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
        text: extractedText,
        simplified: simplifiedText,
        hasAiAnalysis: false,
        detectedLanguage,
      };
      
      // Add to store
      updateProgress('Saving document...', 90);
      if (__DEV__) console.log('Adding document to history');
      addToHistory(newDocument);
      
      // Perform AI analysis if enabled
      if (useAiAnalysis) {
        updateProgress('Performing AI contract analysis...', 95);
        if (__DEV__) console.log('Starting AI analysis');
        
        try {
          const aiAnalysis = await analyzeContract(extractedText);
          if (__DEV__) console.log('AI analysis completed:', aiAnalysis);
          
          // Update the document with AI analysis
          updateDocumentWithAI(newDocument.id, aiAnalysis);
        } catch (aiError) {
          if (__DEV__) console.error('AI analysis error:', aiError);
          // Don't fail the entire process if AI analysis fails
          if (__DEV__) console.log('Continuing without AI analysis');
        }
      }
      
      // Update rate limit status
      const updatedStatus = await getRateLimitStatus();
      setRateLimitStatus(updatedStatus);
      
      // Navigate to results
      updateProgress('Complete!', 100);
      if (__DEV__) console.log('Navigating to results');
      
      // Small delay to show completion
      setTimeout(() => {
        router.push(`/results/${newDocument.id}`);
      }, 500);
    } catch (error) {
      if (__DEV__) console.error('Error processing document:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('File processing failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
      setProcessingProgress(0);
    }
  };

  const canProcess = fileUri && 
                    rateLimitStatus.scansToday < rateLimitStatus.maxScansPerDay && 
                    rateLimitStatus.scansThisMinute < rateLimitStatus.maxScansPerMinute;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          title="Upload Document"
          subtitle="Upload a legal document to simplify and analyze. We support images, PDFs, Word documents, and text files."
        />

        <RateLimitInfo 
          scansToday={rateLimitStatus.scansToday} 
          maxScansPerDay={rateLimitStatus.maxScansPerDay}
          scansThisMinute={rateLimitStatus.scansThisMinute}
          maxScansPerMinute={rateLimitStatus.maxScansPerMinute}
        />

        {/* AI Analysis Toggle */}
        <View style={[styles.aiToggleContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.aiToggleHeader}>
            <Text style={[styles.aiToggleTitle, { color: themeColors.text }]}>
              AI Contract Analysis
            </Text>
            <Button
              title={useAiAnalysis ? "Enabled" : "Disabled"}
              variant={useAiAnalysis ? "primary" : "outline"}
              size="small"
              onPress={() => setUseAiAnalysis(!useAiAnalysis)}
              style={styles.aiToggleButton}
            />
          </View>
          <Text style={[styles.aiToggleDescription, { color: themeColors.textLight }]}>
            {useAiAnalysis 
              ? "AI will analyze sections, assess risks, and provide plain-English summaries."
              : "Only basic text simplification will be performed."
            }
          </Text>
        </View>

        <FileUploader onFileSelected={handleFileSelected} />

        {error && <ErrorMessage message={error} />}

        {isProcessing && (
          <View style={[styles.processingContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <ActivityIndicator size="large" color={isDarkMode ? colors.darkPrimary : colors.primary} />
            <Text style={[styles.processingText, { color: themeColors.text }]}>{processingStatus}</Text>
            <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary,
                    width: `${processingProgress}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: themeColors.textLight }]}>
              {processingProgress}%
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button 
            title={isProcessing ? "Processing..." : "Process Document"} 
            onPress={processDocument}
            loading={isProcessing}
            disabled={!canProcess || isProcessing}
            style={styles.button}
          />
          <Button 
            title="Cancel" 
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
            disabled={isProcessing}
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
  aiToggleContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  aiToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  aiToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  aiToggleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  processingContainer: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    marginTop: 24,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
  },
  button: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
});
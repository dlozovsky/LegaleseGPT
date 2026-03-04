import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

export default function DisclaimerScreen() {
  const { isDarkMode } = useThemeStore();

  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    textLight: colors.darkTextLight,
  } : {
    background: colors.background,
    text: colors.text,
    textLight: colors.textLight,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: "Legal Disclaimer" }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: themeColors.text }]}>Legal Disclaimer</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Not Legal Advice</Text>
          <Text style={[styles.paragraph, { color: themeColors.textLight }]}>
            Legalese GPT is an AI-powered tool designed to simplify legal language. The simplified text provided by this application is for informational purposes only and should not be construed as legal advice.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>No Attorney-Client Relationship</Text>
          <Text style={[styles.paragraph, { color: themeColors.textLight }]}>
            Use of Legalese GPT does not create an attorney-client relationship. The simplified text is a general interpretation and may not address your specific legal situation.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Consult a Legal Professional</Text>
          <Text style={[styles.paragraph, { color: themeColors.textLight }]}>
            For legal matters, always consult with a qualified legal professional. Important legal decisions should not be made solely based on the simplified text provided by this application.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Accuracy Limitations</Text>
          <Text style={[styles.paragraph, { color: themeColors.textLight }]}>
            While we strive for accuracy, the AI simplification process may not capture all nuances, exceptions, or specific legal implications contained in the original text. The original document should always be considered the authoritative version.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Privacy & Data</Text>
          <Text style={[styles.paragraph, { color: themeColors.textLight }]}>
            Documents uploaded or text pasted into Legalese GPT are processed securely. We do not store your documents unless you explicitly save them to your account. Please review our Privacy Policy for more information on how we handle your data.
          </Text>
        </View>
        
        <Button 
          title="I Understand" 
          onPress={() => router.back()}
          style={styles.button}
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  button: {
    marginTop: 16,
  },
});
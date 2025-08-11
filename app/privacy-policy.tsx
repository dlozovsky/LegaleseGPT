import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: "Privacy Policy" }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            Legalese GPT collects the following information:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Documents and text you upload or paste for simplification</Text>
            <Text style={styles.bulletPoint}>• Usage data to improve our services</Text>
            <Text style={styles.bulletPoint}>• Account information if you create an account</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Process and simplify your legal documents</Text>
            <Text style={styles.bulletPoint}>• Improve our AI simplification algorithms</Text>
            <Text style={styles.bulletPoint}>• Provide customer support</Text>
            <Text style={styles.bulletPoint}>• Send updates about our service (if you opt in)</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Storage</Text>
          <Text style={styles.paragraph}>
            Documents you upload or text you paste are processed securely. We do not store your documents unless you explicitly save them to your account. Saved documents are stored securely and can be deleted at any time.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>
            We use third-party services for:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Text extraction from documents</Text>
            <Text style={styles.bulletPoint}>• AI-powered text simplification</Text>
            <Text style={styles.bulletPoint}>• Analytics to improve our service</Text>
          </View>
          <Text style={styles.paragraph}>
            These services may have access to your documents during processing but are bound by strict confidentiality agreements.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Access your saved documents</Text>
            <Text style={styles.bulletPoint}>• Delete your saved documents</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your account and associated data</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about our privacy practices, please contact us at privacy@legalesegpt.com.
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
    marginBottom: 8,
  },
  bulletPoints: {
    marginLeft: 8,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
  },
});
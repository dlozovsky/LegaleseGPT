import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Wand2, Shield, Zap } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import Button from '@/components/Button';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Wand2,
    title: 'Simplify Legal Jargon',
    description:
      'Upload any contract, agreement, or legal document and get a plain-English version in seconds. No law degree required.',
  },
  {
    icon: Shield,
    title: 'AI Risk Analysis',
    description:
      'Our AI scans every clause, flags hidden risks, and highlights key dates and deadlines so nothing catches you off guard.',
  },
  {
    icon: Zap,
    title: 'Ask Follow-up Questions',
    description:
      'Not sure what a clause means? Chat with our AI about any document to get instant, context-aware answers.',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { setHasOnboarded } = useThemeStore();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        {currentStep < steps.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.button}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    height: 44,
  },
  skipText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    width: '100%',
  },
});

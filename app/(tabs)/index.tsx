import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Upload, Type, Camera, User } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import Button from '@/components/Button';

// Resolve Clerk at module level so the hook reference is stable
let clerkAvailable = false;
let useClerkAuth: () => { isSignedIn: boolean; user: any } = () => ({ isSignedIn: false, user: null });
try {
  const clerkExpo = require('@clerk/clerk-expo');
  if (clerkExpo?.useAuth) {
    useClerkAuth = clerkExpo.useAuth;
    clerkAvailable = true;
  }
} catch {
  // Clerk not installed – running in guest mode
}

function useAuth() {
  // Always call the hook unconditionally to satisfy Rules of Hooks.
  // When Clerk is unavailable the stub returns static guest data.
  return useClerkAuth();
}

export default function HomeScreen() {
  const { isDarkMode } = useThemeStore();
  const { isSignedIn, user } = useAuth() as { isSignedIn: boolean; user: any };
  
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

  const handleUploadDocument = () => {
    router.push('/upload');
  };

  const handlePasteText = () => {
    router.push('/paste');
  };

  const handleScanDocument = () => {
    router.push('/camera');
  };

  const handleSignIn = () => {
    router.push('/modal');
  };

  const options = [
    {
      title: 'Upload Document',
      description: 'Upload a PDF or image file',
      icon: Upload,
      onPress: handleUploadDocument,
    },
    {
      title: 'Paste Text',
      description: 'Paste legal text directly',
      icon: Type,
      onPress: handlePasteText,
    },
    {
      title: 'Scan Document',
      description: 'Use camera to scan a document',
      icon: Camera,
      onPress: handleScanDocument,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={[]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Simplify Legal Text
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text }]}>
              Transform complex legal documents into plain English
            </Text>
          </View>

          {/* Authentication Status */}
          {clerkAvailable && (
            <View style={[styles.authCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              {isSignedIn ? (
                <View style={styles.authContent}>
                  <User size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} />
                  <Text style={[styles.authText, { color: themeColors.text }]}>
                    Welcome back, {user?.firstName || 'User'}!
                  </Text>
                </View>
              ) : (
                <View style={styles.authContent}>
                  <User size={20} color={colors.textLight} />
                  <Text style={[styles.authText, { color: themeColors.text }]}>
                    Using guest mode
                  </Text>
                  <Button
                    title="Sign In"
                    variant="outline"
                    onPress={handleSignIn}
                    style={styles.signInButton}
                  />
                </View>
              )}
            </View>
          )}

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }
                ]}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIcon,
                  { backgroundColor: isDarkMode ? colors.darkPrimaryLight : colors.primaryLight }
                ]}>
                  <option.icon size={24} color={isDarkMode ? colors.darkPrimary : colors.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: themeColors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: themeColors.text }]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Section */}
          <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.infoTitle, { color: themeColors.text }]}>
              How it works
            </Text>
            <Text style={[styles.infoText, { color: themeColors.text }]}>
              1. Choose how to input your legal document{'\n'}
              2. Our AI analyzes the text{'\n'}
              3. Get a simplified, easy-to-understand version{'\n'}
              4. Save or share your results
            </Text>
          </View>
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
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  authCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  authContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authText: {
    fontSize: 16,
    flex: 1,
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
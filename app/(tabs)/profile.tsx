import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Shield, 
  Lock, 
  Settings, 
  Sliders,
  User,
  LogOut,
  LogIn
} from 'lucide-react-native';
import colors from '@/constants/colors';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { router } from 'expo-router';
import { useThemeStore } from '@/hooks/useThemeStore';
import Slider from '@/components/Slider';

// Check if Clerk is available
const getClerkHooks = () => {
  try {
    const clerkExpo = require('@clerk/clerk-expo');
    return {
      useUser: clerkExpo.useUser,
      useAuth: clerkExpo.useAuth,
      SignedIn: clerkExpo.SignedIn,
      SignedOut: clerkExpo.SignedOut,
      available: true
    };
  } catch (error) {
    return {
      useUser: () => ({ user: null }),
      useAuth: () => ({ signOut: null, isSignedIn: false }),
      SignedIn: ({ children }: { children: React.ReactNode }) => null,
      SignedOut: ({ children }: { children: React.ReactNode }) => children,
      available: false
    };
  }
};

const clerkHooks = getClerkHooks();

export default function ProfileScreen() {
  // Only use Clerk hooks if available
  const userData = clerkHooks.available ? clerkHooks.useUser() : { user: null };
  const authData = clerkHooks.available ? clerkHooks.useAuth() : { signOut: null, isSignedIn: false };
  
  const { user } = userData;
  const { signOut, isSignedIn } = authData;
  
  const { 
    isDarkMode,
    highContrast, 
    textToSpeech, 
    fontSize,
    saveHistory,
    defaultSimplificationLevel,
    toggleDarkMode,
    toggleHighContrast, 
    toggleTextToSpeech,
    toggleSaveHistory,
    setFontSize,
    setDefaultSimplificationLevel
  } = useThemeStore();

  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    card: colors.darkSecondary,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    border: colors.darkBorder,
  } : {
    background: colors.background,
    card: 'white',
    text: colors.text,
    textLight: colors.textLight,
    border: colors.border,
  };

  const navigateToPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const navigateToDisclaimer = () => {
    router.push('/disclaimer');
  };

  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/modal');
  };

  // Create wrapper components for Clerk components
  const SignedInWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!clerkHooks.available || !isSignedIn) return null;
    return <>{children}</>;
  };

  const SignedOutWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!clerkHooks.available || isSignedIn) return <>{children}</>;
    return <>{children}</>;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          title="Profile & Settings"
          subtitle="Customize your experience and manage your account."
        />

        {clerkHooks.available && (
          <>
            <SignedInWrapper>
              <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Account</Text>
                
                <View style={[styles.userInfo, { borderBottomColor: themeColors.border }]}>
                  <View style={styles.userInfoContent}>
                    <User size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} style={styles.userIcon} />
                    <View>
                      <Text style={[styles.userName, { color: themeColors.text }]}>
                        {user?.firstName} {user?.lastName}
                      </Text>
                      <Text style={[styles.userEmail, { color: themeColors.textLight }]}>
                        {user?.primaryEmailAddress?.emailAddress}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.signOutItem, { borderBottomColor: themeColors.border }]}
                  onPress={handleSignOut}
                >
                  <View style={styles.signOutContent}>
                    <LogOut size={20} color={colors.error} style={styles.signOutIcon} />
                    <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </SignedInWrapper>

            <SignedOutWrapper>
              <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Account</Text>
                
                <View style={styles.signInPrompt}>
                  <LogIn size={24} color={isDarkMode ? colors.darkPrimary : colors.primary} style={styles.signInIcon} />
                  <Text style={[styles.signInTitle, { color: themeColors.text }]}>Sign in to save your documents</Text>
                  <Text style={[styles.signInDescription, { color: themeColors.textLight }]}>
                    Create an account to save your simplified documents, sync across devices, and access your history.
                  </Text>
                  <Button
                    title="Sign In"
                    onPress={handleSignIn}
                    style={styles.signInButton}
                  />
                </View>
              </View>
            </SignedOutWrapper>
          </>
        )}

        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Theme</Text>
          
          <View style={[styles.setting, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: themeColors.textLight }]}>
                Switch between light and dark theme
              </Text>
            </View>
            <View style={styles.settingControl}>
              {isDarkMode ? (
                <Moon size={20} color={colors.darkPrimary} style={styles.settingIcon} />
              ) : (
                <Sun size={20} color={colors.primary} style={styles.settingIcon} />
              )}
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#D1D5DB', true: isDarkMode ? colors.darkPrimary : colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Accessibility</Text>
          
          <View style={[styles.setting, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>High Contrast Mode</Text>
              <Text style={[styles.settingDescription, { color: themeColors.textLight }]}>
                Increase contrast for better readability
              </Text>
            </View>
            <View style={styles.settingControl}>
              <Switch
                value={highContrast}
                onValueChange={toggleHighContrast}
                trackColor={{ false: '#D1D5DB', true: isDarkMode ? colors.darkPrimary : colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
          
          <View style={[styles.setting, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>Text-to-Speech</Text>
              <Text style={[styles.settingDescription, { color: themeColors.textLight }]}>
                Enable reading documents aloud
              </Text>
            </View>
            <View style={styles.settingControl}>
              {textToSpeech ? (
                <Volume2 size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} style={styles.settingIcon} />
              ) : (
                <VolumeX size={20} color={themeColors.textLight} style={styles.settingIcon} />
              )}
              <Switch
                value={textToSpeech}
                onValueChange={toggleTextToSpeech}
                trackColor={{ false: '#D1D5DB', true: isDarkMode ? colors.darkPrimary : colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
          
          <View style={[styles.setting, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>Font Size</Text>
              <Text style={[styles.settingDescription, { color: themeColors.textLight }]}>
                Adjust text size for better readability
              </Text>
            </View>
            <View style={styles.fontSizeControls}>
              <Button
                title="S"
                variant={fontSize === 'small' ? 'primary' : 'outline'}
                size="small"
                style={styles.fontSizeButton}
                onPress={() => setFontSize('small')}
              />
              <Button
                title="M"
                variant={fontSize === 'medium' ? 'primary' : 'outline'}
                size="small"
                style={styles.fontSizeButton}
                onPress={() => setFontSize('medium')}
              />
              <Button
                title="L"
                variant={fontSize === 'large' ? 'primary' : 'outline'}
                size="small"
                style={styles.fontSizeButton}
                onPress={() => setFontSize('large')}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Document Settings</Text>
          
          <View style={[styles.setting, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>Save Document History</Text>
              <Text style={[styles.settingDescription, { color: themeColors.textLight }]}>
                Automatically save processed documents to history
              </Text>
            </View>
            <View style={styles.settingControl}>
              <Switch
                value={saveHistory}
                onValueChange={toggleSaveHistory}
                trackColor={{ false: '#D1D5DB', true: isDarkMode ? colors.darkPrimary : colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
          
          <View style={[styles.setting, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>Default Simplification Level</Text>
              <Text style={[styles.settingDescription, { color: themeColors.textLight }]}>
                Set your preferred simplification level
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderValue, { color: themeColors.textLight }]}>
                  {defaultSimplificationLevel === 1 ? 'Simple' : defaultSimplificationLevel === 2 ? 'Moderate' : 'Detailed'}
                </Text>
              </View>
              <Slider
                value={[defaultSimplificationLevel]}
                onValueChange={(value) => setDefaultSimplificationLevel(value[0])}
                min={1}
                max={3}
                step={1}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Privacy & Legal</Text>
          
          <TouchableOpacity 
            style={[styles.privacyItem, { borderBottomColor: themeColors.border }]}
            onPress={navigateToPrivacyPolicy}
          >
            <View style={styles.privacyItemContent}>
              <Shield size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} style={styles.privacyIcon} />
              <View>
                <Text style={[styles.privacyTitle, { color: themeColors.text }]}>Privacy Policy</Text>
                <Text style={[styles.privacyDescription, { color: themeColors.textLight }]}>
                  How we handle your data and documents
                </Text>
              </View>
            </View>
            <Text style={[styles.linkText, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.privacyItem, { borderBottomColor: themeColors.border }]}
            onPress={navigateToDisclaimer}
          >
            <View style={styles.privacyItemContent}>
              <Lock size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} style={styles.privacyIcon} />
              <View>
                <Text style={[styles.privacyTitle, { color: themeColors.text }]}>Legal Disclaimer</Text>
                <Text style={[styles.privacyDescription, { color: themeColors.textLight }]}>
                  Important information about using our service
                </Text>
              </View>
            </View>
            <Text style={[styles.linkText, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>View</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>About</Text>
          
          <View style={[styles.aboutItem, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.aboutTitle, { color: themeColors.text }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: themeColors.textLight }]}>1.0.0</Text>
          </View>
          
          <View style={[styles.aboutItem, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.aboutTitle, { color: themeColors.text }]}>Terms of Service</Text>
            <Button
              title="View"
              variant="outline"
              size="small"
              style={styles.aboutButton}
            />
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userInfo: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  signOutItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutIcon: {
    marginRight: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signInPrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  signInIcon: {
    marginBottom: 12,
  },
  signInTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  signInDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  signInButton: {
    minWidth: 120,
  },
  setting: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginBottom: Platform.OS === 'web' ? 0 : 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 8,
  },
  fontSizeControls: {
    flexDirection: 'row',
    marginTop: Platform.OS === 'web' ? 0 : 8,
  },
  fontSizeButton: {
    width: 40,
    height: 40,
    marginHorizontal: 4,
  },
  sliderContainer: {
    width: '100%',
    marginTop: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 12,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  aboutTitle: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
  },
  aboutButton: {
    minWidth: 80,
  },
  privacyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  privacyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyIcon: {
    marginRight: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyDescription: {
    fontSize: 14,
  },
  linkText: {
    fontWeight: '600',
  },
});
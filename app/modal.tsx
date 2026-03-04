import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useThemeStore } from '@/hooks/useThemeStore';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { getClerkHooks } from '@/utils/clerkHelpers';

const clerkHooks = getClerkHooks();

export default function AuthModal() {
  const { isDarkMode } = useThemeStore();
  
  // Initialize Clerk hooks only if available
  const signInData = clerkHooks.available ? clerkHooks.useSignIn() : { signIn: null, setActive: null, isLoaded: false };
  const signUpData = clerkHooks.available ? clerkHooks.useSignUp() : { signUp: null, setActive: null, isLoaded: false };
  const authData = clerkHooks.available ? clerkHooks.useAuth() : { isSignedIn: false };
  
  const { signIn, setActive, isLoaded: signInLoaded } = signInData;
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = signUpData;
  const { isSignedIn } = authData;
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  
  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    card: colors.darkSecondary,
    border: colors.darkBorder,
    inputBackground: colors.darkSecondary,
  } : {
    background: colors.background,
    text: colors.text,
    card: 'white',
    border: colors.border,
    inputBackground: 'white',
  };

  // If user is already signed in, redirect to main app
  React.useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn]);

  const handleSignIn = async () => {
    if (!clerkHooks.available || !signInLoaded || !email || !password || !signIn) {
      setError('Authentication service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (__DEV__) console.log('[Auth] signIn.create start', { email });
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (__DEV__) console.log('[Auth] signIn.create result', result?.status);

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Sign in requires additional steps');
      }
    } catch (err: any) {
      if (__DEV__) console.log('[Auth] signIn error', err);
      const msg = Array.isArray(err?.errors) && err.errors[0]?.message ? err.errors[0].message : 'Sign in failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!clerkHooks.available || !signUpLoaded || !email || !password || !signUp) {
      setError('Authentication service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (__DEV__) console.log('[Auth] signUp.create start', { email });
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      if (__DEV__) console.log('[Auth] signUp.create result', result?.status);

      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId });
        router.replace('/(tabs)');
        return;
      }

      if (__DEV__) console.log('[Auth] prepareEmailAddressVerification sending code');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerificationEmailSent(true);
    } catch (err: any) {
      if (__DEV__) console.log('[Auth] signUp error', err);
      const msg = Array.isArray(err?.errors) && err.errors[0]?.message ? err.errors[0].message : 'Sign up failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    router.replace('/(tabs)');
  };

  const handleVerifyCode = async () => {
    if (!clerkHooks.available || !signUpLoaded || !signUp) {
      setError('Authentication service not available');
      return;
    }
    if (!verificationCode || verificationCode.trim().length < 4) {
      setError('Enter the verification code');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (__DEV__) console.log('[Auth] attemptEmailAddressVerification start');
      const verification = await signUp.attemptEmailAddressVerification({ code: verificationCode.trim() });
      if (__DEV__) console.log('[Auth] attemptEmailAddressVerification result', verification?.status);
      if (verification.status === 'complete') {
        await setActiveSignUp({ session: verification.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Verification failed. Check the code and try again.');
      }
    } catch (err: any) {
      if (__DEV__) console.log('[Auth] verify error', err);
      const msg = Array.isArray(err?.errors) && err.errors[0]?.message ? err.errors[0].message : 'Verification failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!clerkHooks.available || !signUpLoaded || !signUp) return;
    try {
      if (__DEV__) console.log('[Auth] resend verification code');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerificationEmailSent(true);
    } catch (e) {
      if (__DEV__) console.log('[Auth] resend error', e);
    }
  };

  // If Clerk is not available, show guest-only mode
  if (!clerkHooks.available) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen 
          options={{ 
            title: "Welcome",
            presentation: 'modal',
            headerStyle: {
              backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary,
            },
            headerTintColor: 'white',
          }} 
        />
        
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Welcome to Legalese GPT
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text }]}>
              Authentication is not configured. You can continue using the app in guest mode.
            </Text>
            
            <View style={styles.buttons}>
              <Button
                title="Continue as Guest"
                onPress={handleContinueAsGuest}
                style={styles.button}
              />
            </View>
            
            <Text style={[styles.note, { color: themeColors.text }]}>
              To enable authentication, please configure your Clerk publishable key in the .env.local file.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen 
        options={{ 
          title: "Authentication",
          presentation: 'modal',
          headerStyle: {
            backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary,
          },
          headerTintColor: 'white',
        }} 
      />
      
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Welcome to Legalese GPT
          </Text>
          {!verificationEmailSent ? (
            <Text style={[styles.subtitle, { color: themeColors.text }]}>
              {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
            </Text>
          ) : (
            <Text style={[styles.subtitle, { color: themeColors.text }]} testID="verificationSubtitle">
              We sent a 6-digit code to {email}. Enter it below to verify your email.
            </Text>
          )}
          
          {!verificationEmailSent ? (
            <View style={styles.form}>
              <TextInput
                testID="emailInput"
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={isDarkMode ? colors.darkTextLight : colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                testID="passwordInput"
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={isDarkMode ? colors.darkTextLight : colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                testID="verificationCodeInput"
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                placeholder="Enter verification code"
                placeholderTextColor={isDarkMode ? colors.darkTextLight : colors.textLight}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType={Platform.OS === 'web' ? 'default' : 'number-pad'}
                autoCapitalize="none"
              />
            </View>
          )}

          {error && <ErrorMessage message={error} />}
          
          <View style={styles.buttons}>
            {!verificationEmailSent ? (
              <>
                <Button
                  testID="primaryAuthButton"
                  title={isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                  onPress={mode === 'signin' ? handleSignIn : handleSignUp}
                  loading={isLoading}
                  disabled={!email || !password || isLoading}
                  style={styles.button}
                />
                <Button
                  testID="switchAuthModeButton"
                  title={mode === 'signin' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
                  variant="outline"
                  onPress={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setError(null);
                  }}
                  style={styles.button}
                />
                <Button
                  testID="guestButton"
                  title="Continue as Guest"
                  variant="outline"
                  onPress={handleContinueAsGuest}
                  style={styles.button}
                />
              </>
            ) : (
              <>
                <Button
                  testID="verifyCodeButton"
                  title={isLoading ? 'Verifying...' : 'Verify Code'}
                  onPress={handleVerifyCode}
                  loading={isLoading}
                  disabled={!verificationCode || isLoading}
                  style={styles.button}
                />
                <Button
                  testID="resendCodeButton"
                  title="Resend Code"
                  variant="outline"
                  onPress={handleResendCode}
                  style={styles.button}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  buttons: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
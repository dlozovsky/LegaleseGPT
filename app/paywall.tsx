import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Crown, Check, X, Sparkles, MessageCircle, Download, Infinity } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useSubscriptionStore } from '@/hooks/useSubscriptionStore';
import Button from '@/components/Button';

interface FeatureRow {
  label: string;
  free: string;
  premium: string;
}

const features: FeatureRow[] = [
  { label: 'Document scans per day', free: '5', premium: 'Unlimited' },
  { label: 'AI contract analysis', free: '5 / day', premium: 'Unlimited' },
  { label: 'AI follow-up chat', free: '10 msgs / day', premium: 'Unlimited' },
  { label: 'Document exports', free: '2 / day', premium: 'Unlimited' },
  { label: 'Key dates extraction', free: 'Basic', premium: 'Full' },
  { label: 'Document comparison', free: 'Not included', premium: 'Included' },
  { label: 'Priority processing', free: 'No', premium: 'Yes' },
];

export default function PaywallScreen() {
  const { isDarkMode } = useThemeStore();
  const { isPremium, setPremium, restorePurchases } = useSubscriptionStore();

  const themeColors = isDarkMode
    ? {
        background: colors.darkBackground,
        text: colors.darkText,
        textLight: colors.darkTextLight,
        card: colors.darkSecondary,
        border: colors.darkBorder,
      }
    : {
        background: colors.background,
        text: colors.text,
        textLight: colors.textLight,
        card: 'white',
        border: colors.border,
      };

  const handleSubscribe = () => {
    // RevenueCat purchase flow goes here.
    // For now, show an alert indicating this is where the purchase would happen.
    Alert.alert(
      'Premium Subscription',
      'In-app purchases will be available when the app launches. For now, enjoy a free preview of premium features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate Preview',
          onPress: () => {
            setPremium(true);
            router.back();
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert('Restore', 'No previous purchases found.');
    } catch {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  if (isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Premium' }} />
        <View style={styles.premiumActiveContainer}>
          <Crown size={48} color={colors.warning} />
          <Text style={[styles.premiumActiveTitle, { color: themeColors.text }]}>
            You are a Premium member
          </Text>
          <Text style={[styles.premiumActiveSubtitle, { color: themeColors.textLight }]}>
            Enjoy unlimited scans, exports, and AI chat.
          </Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} style={styles.backButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Upgrade to Premium' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.crownContainer}>
            <Crown size={40} color={colors.warning} />
          </View>
          <Text style={[styles.heroTitle, { color: themeColors.text }]}>
            Unlock Premium
          </Text>
          <Text style={[styles.heroSubtitle, { color: themeColors.textLight }]}>
            Remove all limits and get the most out of your legal documents.
          </Text>
        </View>

        {/* Feature highlights */}
        <View style={styles.highlights}>
          {[
            { icon: Infinity, label: 'Unlimited scans & analysis' },
            { icon: MessageCircle, label: 'Unlimited AI chat' },
            { icon: Download, label: 'Unlimited exports' },
            { icon: Sparkles, label: 'Priority AI processing' },
          ].map((item, i) => (
            <View key={i} style={[styles.highlightRow, { borderColor: themeColors.border }]}>
              <item.icon size={20} color={isDarkMode ? colors.darkPrimary : colors.primary} />
              <Text style={[styles.highlightText, { color: themeColors.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Comparison table */}
        <View style={[styles.table, { borderColor: themeColors.border }]}>
          <View style={[styles.tableHeader, { backgroundColor: isDarkMode ? colors.darkPrimary + '20' : colors.primaryLight + '30' }]}>
            <Text style={[styles.tableHeaderCell, styles.featureCell, { color: themeColors.text }]}>Feature</Text>
            <Text style={[styles.tableHeaderCell, styles.tierCell, { color: themeColors.textLight }]}>Free</Text>
            <Text style={[styles.tableHeaderCell, styles.tierCell, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>Premium</Text>
          </View>
          {features.map((row, i) => (
            <View key={i} style={[styles.tableRow, { borderColor: themeColors.border }]}>
              <Text style={[styles.featureCell, { color: themeColors.text }]}>{row.label}</Text>
              <Text style={[styles.tierCell, { color: themeColors.textLight }]}>{row.free}</Text>
              <Text style={[styles.tierCell, { color: isDarkMode ? colors.darkPrimary : colors.primary, fontWeight: '600' }]}>{row.premium}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Button title="Subscribe — $4.99/month" onPress={handleSubscribe} style={styles.subscribeButton} size="large" />

        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={[styles.restoreText, { color: themeColors.textLight }]}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={[styles.legal, { color: themeColors.textLight }]}>
          Payment will be charged to your App Store or Google Play account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 24 },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  highlights: { marginBottom: 24, gap: 12 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  highlightText: { fontSize: 16 },
  table: { borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12 },
  tableHeaderCell: { fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1 },
  featureCell: { flex: 2, fontSize: 14 },
  tierCell: { flex: 1, fontSize: 13, textAlign: 'center' },
  subscribeButton: { width: '100%', marginBottom: 12 },
  restoreButton: { alignItems: 'center', padding: 12 },
  restoreText: { fontSize: 14, fontWeight: '500' },
  legal: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 8 },
  premiumActiveContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  premiumActiveTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  premiumActiveSubtitle: { fontSize: 16, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  backButton: { marginTop: 24, minWidth: 140 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Info, Clock } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface RateLimitInfoProps {
  scansToday: number;
  maxScansPerDay: number;
  scansThisMinute?: number;
  maxScansPerMinute?: number;
}

export default function RateLimitInfo({ 
  scansToday, 
  maxScansPerDay, 
  scansThisMinute = 0, 
  maxScansPerMinute = 1 
}: RateLimitInfoProps) {
  const { isDarkMode } = useThemeStore();
  
  const themeColors = isDarkMode ? {
    background: colors.darkSecondary,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    border: colors.darkBorder,
  } : {
    background: colors.secondary,
    text: colors.text,
    textLight: colors.textLight,
    border: colors.border,
  };
  
  const scansRemaining = maxScansPerDay - scansToday;
  const isLowOnScans = scansRemaining <= 2;
  const isAtMinuteLimit = scansThisMinute >= maxScansPerMinute;
  const isAtDayLimit = scansToday >= maxScansPerDay;
  
  // Determine the most critical limit to show
  let displayMessage = '';
  let iconColor = isDarkMode ? colors.darkPrimary : colors.primary;
  let IconComponent = Info;
  
  if (isAtDayLimit) {
    displayMessage = "You've used all 5 free scans today. Try again tomorrow.";
    iconColor = colors.error;
    IconComponent = AlertCircle;
  } else if (isAtMinuteLimit) {
    displayMessage = "Rate limit reached. Try again in a moment.";
    iconColor = colors.warning;
    IconComponent = Clock;
  } else if (isLowOnScans) {
    displayMessage = `You have ${scansRemaining} free scan${scansRemaining === 1 ? '' : 's'} remaining today.`;
    iconColor = colors.warning;
    IconComponent = AlertCircle;
  } else {
    displayMessage = `${scansToday}/${maxScansPerDay} scans used today.`;
  }
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: themeColors.background,
        borderColor: themeColors.border 
      }
    ]}>
      <IconComponent size={16} color={iconColor} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: themeColors.text }]}>
          {displayMessage}
        </Text>
        {scansThisMinute > 0 && !isAtDayLimit && (
          <Text style={[styles.subText, { color: themeColors.textLight }]}>
            {scansThisMinute}/{maxScansPerMinute} scans this minute
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
});
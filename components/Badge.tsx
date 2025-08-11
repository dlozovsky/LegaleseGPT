import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'outline';
  style?: ViewStyle;
}

export default function Badge({ children, variant = 'default', style }: BadgeProps) {
  const { isDarkMode } = useThemeStore();
  
  const themeColors = {
    default: {
      background: isDarkMode ? colors.darkPrimary : colors.primary,
      text: 'white',
    },
    outline: {
      background: 'transparent',
      text: isDarkMode ? colors.darkTextLight : colors.textLight,
      border: isDarkMode ? colors.darkBorder : colors.border,
    }
  };
  
  return (
    <View style={[
      styles.badge,
      { 
        backgroundColor: themeColors[variant].background,
        borderColor: variant === 'outline' ? themeColors.outline.border : undefined,
        borderWidth: variant === 'outline' ? 1 : 0,
      },
      style
    ]}>
      <Text style={[
        styles.text,
        { color: themeColors[variant].text }
      ]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
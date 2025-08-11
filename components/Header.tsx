import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { isDarkMode, fontSize } = useThemeStore();
  
  const themeColors = isDarkMode ? {
    text: colors.darkText,
    textLight: colors.darkTextLight,
  } : {
    text: colors.text,
    textLight: colors.textLight,
  };
  
  // Adjust font size based on user preference
  const getTitleSize = () => {
    switch (fontSize) {
      case 'small':
        return 24;
      case 'large':
        return 32;
      case 'medium':
      default:
        return 28;
    }
  };
  
  const getSubtitleSize = () => {
    switch (fontSize) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      case 'medium':
      default:
        return 16;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[
        styles.title, 
        { 
          color: themeColors.text,
          fontSize: getTitleSize()
        }
      ]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[
          styles.subtitle, 
          { 
            color: themeColors.textLight,
            fontSize: getSubtitleSize()
          }
        ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
});
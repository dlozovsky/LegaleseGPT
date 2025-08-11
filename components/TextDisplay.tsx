import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface TextDisplayProps {
  title: string;
  content: string;
}

export default function TextDisplay({ title, content }: TextDisplayProps) {
  const { isDarkMode, fontSize } = useThemeStore();
  
  const themeColors = isDarkMode ? {
    background: colors.darkSecondary,
    title: colors.darkText,
    content: colors.darkText,
    border: colors.darkBorder,
  } : {
    background: 'white',
    title: colors.text,
    content: colors.text,
    border: colors.border,
  };
  
  // Adjust font size based on user preference
  const getFontSize = () => {
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
    <View style={[
      styles.container, 
      { 
        borderColor: themeColors.border,
        backgroundColor: themeColors.background 
      }
    ]}>
      <Text style={[
        styles.title, 
        { 
          color: themeColors.title,
          backgroundColor: isDarkMode ? colors.darkBackground : colors.secondary,
          borderBottomColor: themeColors.border
        }
      ]}>
        {title}
      </Text>
      <ScrollView style={styles.scrollView}>
        <Text style={[
          styles.content, 
          { 
            color: themeColors.content,
            fontSize: getFontSize() 
          }
        ]}>
          {content}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    borderBottomWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    lineHeight: 22,
    padding: 16,
  },
});
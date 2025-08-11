import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import Button from './Button';
import { useThemeStore } from '@/hooks/useThemeStore';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({ 
  title, 
  description, 
  buttonTitle, 
  onButtonPress 
}: EmptyStateProps) {
  const { isDarkMode } = useThemeStore();
  
  const themeColors = isDarkMode ? {
    text: colors.darkText,
    textLight: colors.darkTextLight,
  } : {
    text: colors.text,
    textLight: colors.textLight,
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: themeColors.textLight }]}>{description}</Text>
      {buttonTitle && onButtonPress && (
        <Button 
          title={buttonTitle} 
          onPress={onButtonPress} 
          style={styles.button}
          variant="outline"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    minWidth: 150,
  },
});
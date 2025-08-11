import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const { isDarkMode } = useThemeStore();
  
  const backgroundColor = isDarkMode ? '#7F1D1D' : '#FFF1F0';
  const borderColor = isDarkMode ? '#DC2626' : '#FFCCC7';
  const textColor = isDarkMode ? '#FECACA' : colors.error;
  
  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <AlertCircle size={20} color={textColor} style={styles.icon} />
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});
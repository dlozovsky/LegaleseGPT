import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface AlertProps {
  children: ReactNode;
  style?: ViewStyle;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export default function Alert({ children, style, type = 'info' }: AlertProps) {
  const { isDarkMode } = useThemeStore();
  
  const getAlertColors = () => {
    if (isDarkMode) {
      switch (type) {
        case 'success':
          return { bg: '#065F46', border: '#059669' };
        case 'warning':
          return { bg: '#78350F', border: '#D97706' };
        case 'error':
          return { bg: '#7F1D1D', border: '#DC2626' };
        case 'info':
        default:
          return { bg: colors.darkSecondary, border: colors.darkBorder };
      }
    } else {
      switch (type) {
        case 'success':
          return { bg: '#ECFDF5', border: '#A7F3D0' };
        case 'warning':
          return { bg: '#FFFBEB', border: '#FCD34D' };
        case 'error':
          return { bg: '#FEF2F2', border: '#FECACA' };
        case 'info':
        default:
          return { bg: 'white', border: colors.border };
      }
    }
  };
  
  const alertColors = getAlertColors();
  
  return (
    <View style={[
      styles.alert, 
      { 
        backgroundColor: alertColors.bg,
        borderColor: alertColors.border
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
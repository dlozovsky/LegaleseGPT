import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}: ButtonProps) {
  const { isDarkMode } = useThemeStore();
  
  // Adjust colors based on theme
  const themeColors = {
    primary: isDarkMode ? colors.darkPrimary : colors.primary,
    secondary: isDarkMode ? colors.darkSecondary : colors.secondary,
    outline: 'transparent',
    primaryText: 'white',
    secondaryText: isDarkMode ? colors.darkText : colors.text,
    outlineText: isDarkMode ? colors.darkPrimary : colors.primary,
    border: isDarkMode ? colors.darkPrimary : colors.primary,
  };
  
  const buttonStyles = [
    styles.button,
    { 
      backgroundColor: themeColors[variant],
      borderColor: variant === 'outline' ? themeColors.border : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
    },
    styles[`${size}Button`],
    style
  ];

  const textStyles = [
    styles.text,
    { color: themeColors[`${variant}Text`] },
    styles[`${size}Text`],
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? themeColors.outlineText : themeColors.primaryText} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title ? <Text style={textStyles}>{title}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
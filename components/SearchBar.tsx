import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps) {
  const { isDarkMode } = useThemeStore();
  
  const themeColors = isDarkMode ? {
    background: colors.darkSecondary,
    text: colors.darkText,
    placeholder: colors.darkTextLight,
    icon: colors.darkTextLight,
    border: colors.darkBorder,
  } : {
    background: 'white',
    text: colors.text,
    placeholder: colors.textLight,
    icon: colors.textLight,
    border: colors.border,
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: themeColors.background,
        borderColor: themeColors.border 
      }
    ]}>
      <Search size={18} color={themeColors.icon} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: themeColors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.placeholder}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <X size={18} color={themeColors.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, Eye } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { router } from 'expo-router';
import { DocumentItem } from '@/constants/mockData';

interface DocumentCardProps {
  document: DocumentItem;
  onDelete: () => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { isDarkMode } = useThemeStore();

  const themeColors = isDarkMode ? {
    card: colors.darkSecondary,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    border: colors.darkBorder,
    viewBg: colors.darkBackground,
    deleteBg: '#7F1D1D',
  } : {
    card: 'white',
    text: colors.text,
    textLight: colors.textLight,
    border: colors.border,
    viewBg: colors.secondary,
    deleteBg: '#FFF1F0',
  };

  const handleView = () => {
    router.push(`/results/${document.id}`);
  };

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>{document.title}</Text>
        <Text style={[styles.date, { color: themeColors.textLight }]}>{document.date}</Text>
      </View>
      <Text style={[styles.preview, { color: themeColors.textLight }]} numberOfLines={2}>
        {document.simplified}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.viewButton, { backgroundColor: themeColors.viewBg }]} 
          onPress={handleView}
        >
          <Eye size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} />
          <Text style={[styles.viewButtonText, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton, { backgroundColor: themeColors.deleteBg }]} 
          onPress={onDelete}
        >
          <Trash2 size={16} color={colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  date: {
    fontSize: 12,
  },
  preview: {
    fontSize: 14,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  viewButton: {},
  deleteButton: {},
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
});
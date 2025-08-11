import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, Eye } from 'lucide-react-native';
import colors from '@/constants/colors';
import { router } from 'expo-router';
import { DocumentItem } from '@/constants/mockData';

interface DocumentCardProps {
  document: DocumentItem;
  onDelete: () => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const handleView = () => {
    router.push(`/results/${document.id}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.date}>{document.date}</Text>
      </View>
      <Text style={styles.preview} numberOfLines={2}>
        {document.simplified}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.viewButton]} 
          onPress={handleView}
        >
          <Eye size={16} color={colors.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  preview: {
    fontSize: 14,
    color: colors.textLight,
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
  viewButton: {
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: '#FFF1F0',
  },
  viewButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
});
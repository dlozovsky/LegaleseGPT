import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Trash2, Search } from 'lucide-react-native';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import SearchBar from '@/components/SearchBar';
import colors from '@/constants/colors';
import { DocumentItem } from '@/constants/mockData';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const { isDarkMode } = useThemeStore();
  const { 
    removeFromHistory, 
    clearAllHistory, 
    historySearchQuery, 
    setHistorySearchQuery, 
    getFilteredHistory 
  } = useDocumentStore();
  
  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    card: colors.darkSecondary,
    border: colors.darkBorder,
  } : {
    background: colors.background,
    text: colors.text,
    textLight: colors.textLight,
    card: 'white',
    border: colors.border,
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document from history?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => removeFromHistory(id),
          style: "destructive"
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all documents from history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear All", 
          onPress: () => clearAllHistory(),
          style: "destructive"
        }
      ]
    );
  };

  const handleView = (id: number) => {
    router.push(`/results/${id}`);
  };

  const filteredDocuments = getFilteredHistory();

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <History size={48} color={themeColors.border} style={styles.emptyIcon} />
      <Text style={[styles.emptyText, { color: themeColors.textLight }]}>
        {historySearchQuery ? "No documents match your search" : "No history yet"}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: DocumentItem }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.title}</Text>
        <Badge variant="outline">{item.date}</Badge>
      </View>
      <Text style={[styles.originalText, { color: themeColors.textLight }]} numberOfLines={2}>{item.text}</Text>
      <View style={[styles.simplifiedContainer, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.simplifiedText, { color: themeColors.text }]}>{item.simplified}</Text>
      </View>
      <View style={styles.actions}>
        <Button
          title="View"
          variant="outline"
          size="small"
          onPress={() => handleView(item.id)}
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          variant="outline"
          size="small"
          onPress={() => handleDelete(item.id)}
          style={[styles.actionButton, styles.deleteButton]}
          textStyle={styles.deleteButtonText}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: themeColors.text }]}>Recent Documents</Text>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Trash2 size={18} color={colors.error} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        <SearchBar 
          value={historySearchQuery}
          onChangeText={setHistorySearchQuery}
          placeholder="Search documents..."
        />
      </View>
      
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    marginLeft: 4,
    color: colors.error,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  originalText: {
    fontSize: 14,
    marginBottom: 12,
  },
  simplifiedContainer: {
    padding: 12,
    borderRadius: 8,
  },
  simplifiedText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
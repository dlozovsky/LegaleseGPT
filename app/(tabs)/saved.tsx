import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Copy, Share2 } from 'lucide-react-native';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import SearchBar from '@/components/SearchBar';
import colors from '@/constants/colors';
import * as Clipboard from 'expo-clipboard';
import { DocumentItem } from '@/constants/mockData';
import { router } from 'expo-router';

export default function SavedScreen() {
  const { isDarkMode } = useThemeStore();
  const { 
    removeFromSaved, 
    searchQuery, 
    setSearchQuery, 
    getFilteredSaved 
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

  const handleCopy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Success', 'Copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleShare = async (document: DocumentItem) => {
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'Sharing is not available on web');
      return;
    }
    
    try {
      // Create a text string with the document content
      const shareText = `
${document.title}

ORIGINAL TEXT:
${document.text}

SIMPLIFIED TEXT:
${document.simplified}

Simplified with Legalese GPT
`;

      // Use the Share API which works on both iOS and Android
      await Share.share({
        message: shareText,
        title: document.title,
      });
    } catch (error) {
      console.error('Error sharing document:', error);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this saved document?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => removeFromSaved(id),
          style: "destructive"
        }
      ]
    );
  };

  const handleView = (id: number) => {
    router.push(`/results/${id}`);
  };

  const filteredDocuments = getFilteredSaved();

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Bookmark size={48} color={themeColors.border} style={styles.emptyIcon} />
      <Text style={[styles.emptyText, { color: themeColors.textLight }]}>
        {searchQuery ? "No documents match your search" : "No saved documents"}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: DocumentItem }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Bookmark size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} style={styles.bookmarkIcon} />
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.title}</Text>
        </View>
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
          title="Copy"
          icon={<Copy size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} />}
          variant="outline"
          size="small"
          onPress={() => handleCopy(item.simplified)}
          style={styles.actionButton}
        />
        <Button
          title="Share"
          icon={<Share2 size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} />}
          variant="outline"
          size="small"
          onPress={() => handleShare(item)}
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
        <Text style={[styles.title, { color: themeColors.text }]}>Saved Documents</Text>
        
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search saved documents..."
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkIcon: {
    marginRight: 8,
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
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: Platform.OS === 'web' ? 80 : undefined,
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
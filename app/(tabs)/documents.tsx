import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { DocumentItem, historyItems } from '@/constants/mockData';
import colors from '@/constants/colors';

export default function DocumentsScreen() {
  const { history, addToHistory, removeFromHistory } = useDocumentStore();
  const [isLoading, setIsLoading] = useState(true);

  // Load sample documents for demo purposes
  useEffect(() => {
    const loadSampleDocuments = async () => {
      // Only add sample documents if there are none
      if (history && history.length === 0) {
        historyItems.forEach(doc => {
          addToHistory(doc);
        });
      }
      setIsLoading(false);
    };

    loadSampleDocuments();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
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

  const navigateToUpload = () => {
    router.push('/upload');
  };

  if (isLoading) {
    return null;
  }

  const documents = history || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Header 
          title="My Documents"
          subtitle="View and manage your simplified legal documents."
        />

        {documents.length > 0 ? (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }: { item: DocumentItem }) => (
              <DocumentCard 
                document={item} 
                onDelete={() => handleDelete(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            title="No Documents Yet"
            description="Upload a document or paste text to get started."
            buttonTitle="Upload Document"
            onButtonPress={navigateToUpload}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});
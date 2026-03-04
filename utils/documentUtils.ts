import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { analyzeDocumentType } from './aiService';

// Generate a title based on document content and type
export async function generateDocumentTitle(text: string): Promise<string> {
  // Try to determine document type using AI
  const documentType = await analyzeDocumentType(text);
  
  // Create a timestamp
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  });
  
  // Return a formatted title
  return `${documentType} - ${timestamp}`;
}

// Create a temporary file for sharing
export async function createShareableFile(content: string, filename: string): Promise<string> {
  // Check if we're on web or if FileSystem is not available
  if (Platform.OS === 'web' || !FileSystem) {
    if (__DEV__) console.log('FileSystem not available for sharing on web');
    throw new Error('File sharing is not available on web');
  }
  
  try {
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content);
    return fileUri;
  } catch (error) {
    if (__DEV__) console.error('Error creating shareable file:', error);
    throw new Error('Failed to create shareable file');
  }
}

// Calculate reading time for a text
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum pages for PDF documents
const MAX_PDF_PAGES = 15;

// Maximum characters for text documents
const MAX_TEXT_LENGTH = 50000; // Approximately 15 pages of text

/**
 * Check if a document is too large to process
 * @param text The document text or file path
 * @returns Boolean indicating if the document is too large
 */
export function isDocumentTooLarge(text: string): boolean {
  if (!text) return false;
  
  // For text content, check character count
  if (text.length > MAX_TEXT_LENGTH) {
    return true;
  }
  
  return false;
}

/**
 * Check if a file is too large based on file size
 * @param fileUri The file URI
 * @returns Promise<boolean> indicating if the file is too large
 */
export async function isFileTooLarge(fileUri: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists && 'size' in fileInfo && fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
      return true;
    }
    return false;
  } catch (error) {
    if (__DEV__) console.error('Error checking file size:', error);
    return false;
  }
}

/**
 * Extract text from PDF files
 * @param fileUri The PDF file URI
 * @returns Promise<string> with extracted text
 */
export async function extractTextFromPDF(fileUri: string): Promise<string> {
  try {
    // Check file size first
    const isTooLarge = await isFileTooLarge(fileUri);
    if (isTooLarge) {
      throw new Error('PDF file is too large. Please upload a file smaller than 10MB.');
    }

    if (Platform.OS === 'web') {
      throw new Error('PDF processing is not available on web. Please use the mobile app or paste text directly.');
    }

    // PDF text extraction requires a native library (e.g. react-native-pdf-lib).
    // Until one is integrated, guide the user to an alternative input method.
    throw new Error('PDF text extraction is not yet supported. Please take a photo of the document or paste the text directly.');
  } catch (error) {
    if (__DEV__) console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extract text from Word documents
 * @param fileUri The Word document file URI
 * @param fileType The file type (doc or docx)
 * @returns Promise<string> with extracted text
 */
export async function extractTextFromWord(fileUri: string, fileType: string): Promise<string> {
  try {
    // Check file size first
    const isTooLarge = await isFileTooLarge(fileUri);
    if (isTooLarge) {
      throw new Error(`${fileType.toUpperCase()} file is too large. Please upload a file smaller than 10MB.`);
    }

    if (Platform.OS === 'web') {
      throw new Error(`${fileType.toUpperCase()} processing is not available on web. Please use the mobile app or paste text directly.`);
    }

    // Word doc extraction requires a native library (e.g. mammoth.js).
    // Until one is integrated, guide the user to an alternative input method.
    throw new Error(`${fileType.toUpperCase()} text extraction is not yet supported. Please take a photo of the document or paste the text directly.`);
  } catch (error) {
    if (__DEV__) console.error(`Error extracting text from ${fileType}:`, error);
    throw error;
  }
}

/**
 * Extract text from plain text files
 * @param fileUri The text file URI
 * @returns Promise<string> with file content
 */
export async function extractTextFromTextFile(fileUri: string): Promise<string> {
  try {
    // Check file size first
    const isTooLarge = await isFileTooLarge(fileUri);
    if (isTooLarge) {
      throw new Error('Text file is too large. Please upload a file smaller than 10MB.');
    }

    // Read the file content
    const content = await FileSystem.readAsStringAsync(fileUri);
    
    if (!content || content.trim().length === 0) {
      throw new Error('The text file appears to be empty.');
    }

    // Check if the content is too long
    if (isDocumentTooLarge(content)) {
      throw new Error('The text file is too long. Please upload a shorter document (fewer than 15 pages).');
    }

    return content;
  } catch (error) {
    if (__DEV__) console.error('Error reading text file:', error);
    throw error;
  }
}

/**
 * Validate file type
 * @param fileName The file name
 * @param mimeType The MIME type
 * @returns Object with file type and validation result
 */
export function validateFileType(fileName: string, mimeType?: string): {
  isValid: boolean;
  fileType: string;
  error?: string;
} {
  if (!fileName) {
    return {
      isValid: false,
      fileType: 'unknown',
      error: 'No file name provided'
    };
  }

  const lowerFileName = fileName.toLowerCase();
  
  // Check for supported image types
  if (lowerFileName.endsWith('.jpg') || 
      lowerFileName.endsWith('.jpeg') || 
      lowerFileName.endsWith('.png') ||
      mimeType?.startsWith('image/')) {
    return {
      isValid: true,
      fileType: 'image'
    };
  }
  
  // Check for PDF
  if (lowerFileName.endsWith('.pdf') || mimeType === 'application/pdf') {
    return {
      isValid: true,
      fileType: 'pdf'
    };
  }
  
  // Check for Word documents
  if (lowerFileName.endsWith('.doc') || 
      lowerFileName.endsWith('.docx') ||
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const fileType = lowerFileName.endsWith('.docx') ? 'docx' : 'doc';
    return {
      isValid: true,
      fileType
    };
  }
  
  // Check for text files
  if (lowerFileName.endsWith('.txt') || mimeType === 'text/plain') {
    return {
      isValid: true,
      fileType: 'text'
    };
  }
  
  return {
    isValid: false,
    fileType: 'unknown',
    error: 'Unsupported file type. Please upload JPG, PNG, PDF, DOC, DOCX, or TXT files.'
  };
}

/**
 * Get file info including size and type
 * @param fileUri The file URI
 * @returns Promise with file information
 */
export async function getFileInfo(fileUri: string): Promise<{
  size: number;
  exists: boolean;
  isDirectory: boolean;
  modificationTime: number;
  uri: string;
}> {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    
    // Handle the discriminated union type properly
    if (info.exists) {
      return {
        size: 'size' in info ? info.size ?? 0 : 0,
        exists: info.exists,
        isDirectory: 'isDirectory' in info ? info.isDirectory ?? false : false,
        modificationTime: 'modificationTime' in info ? info.modificationTime ?? 0 : 0,
        uri: info.uri
      };
    } else {
      return {
        size: 0,
        exists: false,
        isDirectory: false,
        modificationTime: 0,
        uri: info.uri
      };
    }
  } catch (error) {
    if (__DEV__) console.error('Error getting file info:', error);
    throw new Error('Failed to get file information');
  }
}
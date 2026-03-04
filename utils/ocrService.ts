import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { isLegalDocument, simplifyText } from './aiService';
import { isDocumentTooLarge } from './documentProcessing';

// Lazy-load ML Kit to avoid crashes on platforms where it's unavailable
let TextRecognition: typeof import('@react-native-ml-kit/text-recognition') | null = null;
try {
  if (Platform.OS !== 'web') {
    TextRecognition = require('@react-native-ml-kit/text-recognition');
  }
} catch {
  // ML Kit not available – will fall back to mock OCR
}

/**
 * Extract text from an image using OCR and then simplify it
 * @param imageUri URI of the image to process
 * @returns Promise with extracted and simplified text object
 */
export async function extractTextFromImage(imageUri: string): Promise<{
  originalText: string;
  simplifiedText: string;
}> {
  try {
    if (__DEV__) console.log('Starting OCR extraction for image:', imageUri);
    
    // First, extract the raw text from the image
    const extractedText = await performOCR(imageUri);
    
    // Validate the extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text was detected in the image. Please try again with a clearer image or better lighting.');
    }
    
    // Check if the document is too large
    if (isDocumentTooLarge(extractedText)) {
      throw new Error('The document is too large to process. Please upload a document with fewer than 15 pages.');
    }
    
    // Validate that it's a legal document BEFORE simplification
    if (!isLegalDocument(extractedText)) {
      throw new Error('The captured image does not appear to contain a legal document. Please capture an image of a contract, agreement, or terms document.');
    }
    
    // Now simplify the extracted text using the AI API
    if (__DEV__) console.log('Simplifying extracted text using AI API...');
    const simplifiedText = await simplifyText(extractedText);
    
    if (__DEV__) console.log('OCR extraction and AI simplification completed successfully');
    return {
      originalText: extractedText,
      simplifiedText: simplifiedText
    };
    
  } catch (error) {
    if (__DEV__) console.error('OCR extraction error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('OCR failed: Unable to extract text from image');
  }
}

/**
 * Perform OCR on an image using ML Kit when available, with mock fallback
 * @param imageUri URI of the image
 * @returns Promise with extracted text
 */
async function performOCR(imageUri: string): Promise<string> {
  // On native platforms, attempt real OCR via ML Kit
  if (Platform.OS !== 'web' && TextRecognition && imageUri.startsWith('file:')) {
    if (__DEV__) console.log('Performing ML Kit text recognition on:', imageUri);
    try {
      const result = await TextRecognition.default.recognize(imageUri);
      const extractedText = result.text;
      if (extractedText && extractedText.trim().length > 0) {
        if (__DEV__) console.log('ML Kit extracted text length:', extractedText.length);
        return extractedText;
      }
      throw new Error('No text detected in the image. Please try with a clearer image.');
    } catch (err) {
      // If ML Kit fails, let the error propagate – don't silently fall back to mock
      if (err instanceof Error) throw err;
      throw new Error('Text recognition failed. Please try with a clearer image.');
    }
  }

  // Web / simulator fallback – return mock data so the app remains demo-able
  if (__DEV__) console.log('Using mock OCR (web or simulator)');
  await new Promise(resolve => setTimeout(resolve, 1500));

  return `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on January 15, 2024, between PROPERTY MANAGEMENT LLC (Landlord) and JOHN SMITH (Tenant).

PROPERTY: 456 Oak Street, Apartment 3B, Springfield, IL 62701

LEASE TERM: 12 months, from February 1, 2024 to January 31, 2025

MONTHLY RENT: $1,200.00 due on the 1st of each month
Late fee of $50.00 applies after the 5th of the month

SECURITY DEPOSIT: $1,200.00 required before move-in

UTILITIES: Tenant pays electricity, gas, internet, and cable
Landlord pays water, sewer, and trash collection

PETS: One cat or dog under 25 lbs allowed with $300 pet deposit

MAINTENANCE: Tenant responsible for minor repairs under $100
Landlord handles major repairs and appliances

TERMINATION: 30-day written notice required from either party

Both parties agree to all terms stated above.`;
}

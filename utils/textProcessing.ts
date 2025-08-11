// This is a mock implementation of text processing
// In a real app, this would connect to an AI service

export async function simplifyText(text: string): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, we'll use a simple transformation
  // In a real app, this would call an AI API
  
  try {
    // Simple replacements for demo
    const simplifications: Record<string, string> = {
      'hereinafter': 'from now on',
      'aforementioned': 'previously mentioned',
      'pursuant to': 'according to',
      'notwithstanding': 'despite',
      'in accordance with': 'following',
      'shall': 'will',
      'deemed to be': 'considered',
      'in the event that': 'if',
      'prior to': 'before',
      'subsequent to': 'after',
      'in lieu of': 'instead of',
      'for the purpose of': 'to',
      'in the amount of': 'for',
      'with respect to': 'about',
      'in connection with': 'related to',
      'in relation to': 'about',
      'in the absence of': 'without',
      'in excess of': 'more than',
      'in addition to': 'besides',
      'in order to': 'to',
    };
    
    let simplified = text;
    
    // Replace legal terms with simpler alternatives
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });
    
    // Break long sentences
    simplified = simplified.replace(/([.!?])\s+/g, '$1\n\n');
    
    // If the text is very short, return a default message
    if (text.length < 20) {
      return "Please provide more text to simplify.";
    }
    
    // Simulate random errors for testing (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Text simplification failed. Our AI service is temporarily unavailable.');
    }
    
    return simplified;
  } catch (error) {
    console.error('Error in simplifyText:', error);
    throw error;
  }
}

export function extractTextFromImage(imageUri: string): Promise<string> {
  // In a real app, this would use OCR
  // For demo, we'll return mock text based on the image source
  
  return new Promise((resolve, reject) => {
    // Simulate processing delay
    setTimeout(() => {
      try {
        // Simulate random errors for testing (10% chance)
        if (Math.random() < 0.1) {
          reject(new Error('Text extraction failed. Check your file and retry.'));
          return;
        }
        
        // If it's from camera, return a different mock text to show variety
        if (imageUri.includes('file:')) {
          resolve(
            "THIS AGREEMENT made as of the 15th day of June, 2023 BETWEEN: ACME CORPORATION, a corporation incorporated under the laws of Delaware (hereinafter referred to as the \"Company\") AND JOHN DOE, of the City of New York (hereinafter referred to as the \"Consultant\") WHEREAS the Company desires to engage the Consultant to provide certain services in connection with the Company's business; AND WHEREAS the Consultant has agreed to provide such services to the Company on the terms and conditions hereinafter set forth; NOW THEREFORE THIS AGREEMENT WITNESSES that in consideration of the mutual covenants and agreements herein contained, the parties hereto agree as follows..."
          );
        } else {
          // Default mock text for uploaded images
          resolve(
            "WHEREAS, the parties hereto desire to establish the terms and conditions under which the Service Provider shall provide services to the Client, and the Client shall compensate the Service Provider for such services. NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, the parties hereto agree as follows..."
          );
        }
      } catch (error) {
        reject(new Error('Text extraction failed. The file may be corrupted or unsupported.'));
      }
    }, 2000);
  });
}

export function generateDocumentTitle(text: string): string {
  // Extract a title from the text
  // For demo purposes, we'll use a simple approach
  const firstLine = text.split('\n')[0].trim();
  
  if (firstLine.length > 50) {
    return firstLine.substring(0, 47) + '...';
  }
  
  if (firstLine.length < 5) {
    return 'Legal Document';
  }
  
  return firstLine;
}
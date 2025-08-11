import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { isLegalDocument, simplifyText } from './aiService';
import { isDocumentTooLarge } from './documentProcessing';

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
    console.log('Starting OCR extraction for image:', imageUri);
    
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
    console.log('Simplifying extracted text using AI API...');
    const simplifiedText = await simplifyText(extractedText);
    
    console.log('OCR extraction and AI simplification completed successfully');
    return {
      originalText: extractedText,
      simplifiedText: simplifiedText
    };
    
  } catch (error) {
    console.error('OCR extraction error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('OCR failed: Unable to extract text from image');
  }
}

/**
 * Perform OCR on an image (mock implementation for demo)
 * @param imageUri URI of the image
 * @returns Promise with extracted text
 */
async function performOCR(imageUri: string): Promise<string> {
  // For web or when using a mock image URI in the simulator
  if (Platform.OS === 'web' || imageUri.startsWith('https://example.com') || !imageUri.startsWith('file:')) {
    console.log('Using mock OCR for web or simulator');
    
    // Simulate realistic processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return realistic legal document text based on common document types
    const mockTexts = [
      // Rental Agreement
      `RESIDENTIAL LEASE AGREEMENT

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

Both parties agree to all terms stated above.`,

      // Employment Contract
      `EMPLOYMENT AGREEMENT

COMPANY: TechStart Solutions Inc.
EMPLOYEE: Sarah Johnson
POSITION: Senior Marketing Manager
START DATE: March 1, 2024

COMPENSATION:
- Annual Salary: $75,000
- Performance bonus up to 15% annually
- Paid bi-weekly on Fridays

BENEFITS:
- Health insurance (company pays 85%)
- Dental and vision coverage
- 401(k) with 4% company match
- 3 weeks paid vacation
- 10 sick days per year
- Professional development budget: $2,000

WORK SCHEDULE: Monday-Friday, 9:00 AM - 5:00 PM
Remote work allowed up to 2 days per week

CONFIDENTIALITY: Employee agrees to protect all company trade secrets and confidential information

NON-COMPETE: Employee cannot work for direct competitors for 6 months after employment ends

TERMINATION: Either party may terminate with 2 weeks written notice

This agreement follows all applicable employment laws.`,

      // NDA
      `NON-DISCLOSURE AGREEMENT

PARTIES: InnovateTech Corp. and Alex Rodriguez (Consultant)
DATE: February 10, 2024
PURPOSE: Evaluation of potential business partnership

CONFIDENTIAL INFORMATION includes:
• Business strategies and plans
• Financial data and projections
• Customer lists and contact information
• Technical specifications and designs
• Marketing strategies and campaigns
• Any information marked "Confidential"

OBLIGATIONS:
1. Keep all confidential information strictly secret
2. Do not disclose to any third parties without written consent
3. Use information only for the stated business purpose
4. Return all materials upon request or project completion

TERM: This agreement remains in effect for 5 years from signing date

EXCEPTIONS: Does not apply to information that is:
- Already publicly available
- Known before disclosure
- Independently developed
- Received from authorized third parties

REMEDIES: Violation may result in immediate legal action and monetary damages

GOVERNING LAW: State of California

Both parties acknowledge understanding and agree to these terms.`
    ];
    
    // Randomly select one of the mock texts to simulate variety
    const selectedText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    return selectedText;
  }
  
  // For actual device camera captures
  // In a real app, this would use a real OCR service like Google Vision API, AWS Textract, etc.
  // For now, we'll still use mock data but with a different selection
  console.log('Processing camera-captured image');
  
  // Simulate realistic processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Different set of mock texts for camera captures to show variety
  const cameraTexts = [
    `SERVICE AGREEMENT

BETWEEN: ABC Consulting Services ("Provider")
AND: XYZ Corporation ("Client")
EFFECTIVE DATE: April 1, 2024

SERVICES:
Provider agrees to deliver the following services to Client:
1. Strategic business analysis
2. Market research and competitive analysis
3. Implementation of business intelligence tools
4. Monthly performance reporting

TERM:
Initial term of 12 months, commencing on the Effective Date
Automatic renewal for successive 6-month periods unless terminated

FEES AND PAYMENT:
- Monthly retainer: $5,000
- Additional services billed at $150/hour
- Expenses reimbursed with prior approval
- Invoices due within 30 days of receipt

CONFIDENTIALITY:
Both parties shall maintain strict confidentiality of all information
No disclosure to third parties without written consent

TERMINATION:
Either party may terminate with 60 days written notice
Client responsible for payment of services rendered prior to termination

LIMITATION OF LIABILITY:
Provider's liability limited to fees paid during preceding 3 months
No liability for indirect, special, or consequential damages

GOVERNING LAW:
This Agreement shall be governed by the laws of the State of New York

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.`,

    `INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is made between Creative Design Studio ("Company") and John Doe ("Contractor") on March 15, 2024.

1. SERVICES
Contractor will provide the following services:
- Website design and development
- Logo and brand identity creation
- Marketing materials design
- Social media graphics

2. COMPENSATION
- Fixed project fee: $3,500
- 50% deposit due upon signing
- Remaining 50% due upon project completion
- Additional revisions billed at $75/hour

3. TIMELINE
- Project start: March 20, 2024
- First draft delivery: April 10, 2024
- Final delivery: May 1, 2024

4. INTELLECTUAL PROPERTY
Upon full payment, all rights to deliverables transfer to Company
Contractor retains right to display work in portfolio

5. RELATIONSHIP
Contractor is an independent contractor, not an employee
Contractor responsible for all taxes and insurance

6. CONFIDENTIALITY
Contractor shall not disclose Company's confidential information
Obligation continues for 2 years after termination

7. TERMINATION
Either party may terminate with 7 days written notice
Company pays for work completed through termination date

8. GENERAL PROVISIONS
- No modification unless in writing signed by both parties
- Agreement governed by California law
- Disputes resolved through binding arbitration

Signed and agreed to by both parties on the date first written above.`,

    `PURCHASE AND SALE AGREEMENT

SELLER: Smith Property Holdings LLC
BUYER: First Time Homebuyer Couple
PROPERTY: 123 Maple Avenue, Anytown, USA 12345

PURCHASE PRICE: $350,000.00
EARNEST MONEY DEPOSIT: $10,000.00 to be held in escrow

FINANCING:
Buyer to obtain mortgage financing within 30 days
Loan amount not to exceed 80% of purchase price
Sale contingent on financing approval

INSPECTIONS:
Buyer has right to inspect property within 10 days
Buyer may terminate if inspection reveals major defects
Seller to provide access for all inspections

CLOSING:
Closing to occur on or before June 30, 2024
Closing costs split according to local custom
Property taxes prorated as of closing date

TITLE:
Seller to convey marketable title by warranty deed
Title insurance policy to be provided at Seller's expense
Buyer has 15 days to review and object to title issues

POSSESSION:
Buyer to take possession at closing
Property to be delivered in broom-clean condition
All appliances and fixtures included in sale

DEFAULT:
If Buyer defaults, earnest money forfeited to Seller
If Seller defaults, Buyer may seek specific performance

This Agreement constitutes the entire understanding between the parties.`
  ];
  
  // Randomly select one of the camera texts
  const selectedText = cameraTexts[Math.floor(Math.random() * cameraTexts.length)];
  return selectedText;
}
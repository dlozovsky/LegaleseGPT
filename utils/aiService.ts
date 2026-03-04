// AI Service for text processing and contract analysis
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API endpoint from toolkit
// WARNING: This endpoint has no authentication. In production, requests should
// be proxied through a backend that attaches an API key.
const API_URL = 'https://toolkit.rork.com/text/llm/';

// User rate limiting constants
// WARNING: Rate limiting is enforced client-side only (AsyncStorage). A
// server-side enforcement layer is required before any real launch.
const MAX_SCANS_PER_MINUTE = 1;
const MAX_SCANS_PER_DAY = 5;
const MAX_TOKENS_PER_MINUTE = 33000;
const MINUTE_RESET_MS = 60 * 1000; // 60 seconds
const DAY_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high';

// Section categories
export type SectionCategory = 
  | 'Termination & Renewal'
  | 'Payment & Fees'
  | 'Liability & Indemnity'
  | 'Confidentiality & Non-Compete'
  | 'Miscellaneous';

// AI Analysis interfaces
export interface SectionAnalysis {
  heading: string;
  summary: string;
  confidence: number;
  category: SectionCategory;
  risk: RiskLevel;
  tooltip?: string;
  originalText: string;
}

export interface ContractAnalysis {
  sections: SectionAnalysis[];
  overallRisk: RiskLevel;
  keyFindings: string[];
  documentType: string;
}

// User counters interface
interface UserCounters {
  scansThisMinute: number;
  scansToday: number;
  tokensThisMinute: number;
  minuteReset: number; // timestamp
  dailyReset: number; // timestamp
}

/**
 * Process text using AI API with proper error handling
 * @param messages Array of messages to send to AI API
 * @returns Promise with the processed text
 */
export async function callAPI(messages: any[]): Promise<string> {
  try {
    if (__DEV__) console.log('Calling AI API with messages:', JSON.stringify(messages).substring(0, 200) + '...');
    
    // Check rate limits before making the API call
    const canProceed = await checkRateLimits();
    if (!canProceed.allowed) {
      throw new Error(canProceed.message);
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        messages,
        max_output_tokens: 10000 // Set max output tokens as requested
      }),
    });

    if (__DEV__) console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      if (__DEV__) console.error('API error response:', errorText);
      
      // Handle 500 errors specifically
      if (response.status === 500) {
        throw new Error('The AI service is temporarily unavailable. Please try again in a few moments.');
      }
      
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (__DEV__) console.log('API Response data:', data);
    
    if (!data.completion) {
      throw new Error('No completion returned from API');
    }
    
    // Update token usage with actual usage from API response
    const actualTokens = data.usage?.total_tokens || estimateTokens(messages, data.completion);
    await updateTokenUsage(actualTokens);
    
    if (__DEV__) console.log('Successfully received response from API');
    return data.completion;
  } catch (error) {
    if (__DEV__) console.error('Error calling API:', error);
    throw error; // Don't fall back to mock - let the caller handle the error
  }
}

/**
 * Estimate token count if not provided by API
 * @param messages Input messages
 * @param completion API response
 * @returns Estimated token count
 */
function estimateTokens(messages: any[], completion: string): number {
  // Roughly estimate 1 token per 4 characters
  const inputTokens = Math.ceil(JSON.stringify(messages).length / 4);
  const outputTokens = Math.ceil(completion.length / 4);
  return inputTokens + outputTokens;
}

/**
 * Check if the text appears to be a legal document or contract
 * @param text Text to validate
 * @returns Boolean indicating if it's likely a legal document
 */
export function isLegalDocument(text: string): boolean {
  if (!text || typeof text !== 'string' || text.length < 30) {
    return false;
  }
  
  const legalKeywords = [
    // English
    'agreement', 'contract', 'terms', 'conditions', 'parties', 'hereby',
    'shall', 'provisions', 'clause', 'pursuant', 'obligations', 'rights',
    'liability', 'termination', 'governing law', 'jurisdiction', 'warranty',
    'indemnification', 'confidential', 'disclosure', 'intellectual property',
    'effective date', 'execution', 'signatory', 'whereas', 'notwithstanding',
    'herein', 'hereof', 'hereto', 'hereunder', 'aforementioned', 'licensee',
    'licensor', 'tenant', 'landlord', 'employer', 'employee', 'vendor',
    'client', 'buyer', 'seller', 'service provider', 'consultant', 'lease',
    'rental', 'employment', 'non-disclosure', 'nda', 'license', 'purchase',
    'sale', 'payment', 'fee', 'compensation', 'delivery', 'performance',
    'breach', 'default', 'remedy', 'dispute', 'arbitration', 'court',
    'legal', 'law', 'regulation', 'compliance', 'authorized', 'binding',
    'enforce', 'valid', 'void', 'null', 'amendment', 'modification',
    'privacy policy', 'terms of service', 'end user', 'software license',
    'master agreement', 'statement of work', 'work order', 'purchase order',
    'subscription', 'membership', 'user agreement', 'license terms',
    'service terms', 'website terms', 'app terms', 'platform terms',
    'data processing', 'cookies', 'gdpr', 'ccpa', 'privacy notice',
    'consent', 'opt-in', 'opt-out', 'third party', 'affiliate', 'partner',
    // Spanish
    'contrato', 'acuerdo', 'términos', 'condiciones', 'partes', 'cláusula',
    'obligaciones', 'derechos', 'responsabilidad', 'rescisión', 'garantía',
    'confidencialidad', 'arrendamiento', 'inquilino', 'arrendador',
    'empleador', 'empleado', 'pago', 'compensación', 'ley aplicable',
    'jurisdicción', 'política de privacidad', 'términos de servicio',
    // French
    'contrat', 'accord', 'conditions', 'parties', 'clause', 'obligations',
    'droits', 'responsabilité', 'résiliation', 'garantie', 'confidentialité',
    'bail', 'locataire', 'bailleur', 'employeur', 'employé', 'paiement',
    'rémunération', 'loi applicable', 'juridiction', 'politique de confidentialité',
    // German
    'vertrag', 'vereinbarung', 'bedingungen', 'parteien', 'klausel',
    'verpflichtungen', 'rechte', 'haftung', 'kündigung', 'garantie',
    'vertraulichkeit', 'mietvertrag', 'mieter', 'vermieter', 'arbeitgeber',
    'arbeitnehmer', 'zahlung', 'vergütung', 'anwendbares recht', 'gerichtsstand',
    'datenschutzrichtlinie',
    // Portuguese
    'contrato', 'acordo', 'termos', 'condições', 'partes', 'cláusula',
    'obrigações', 'direitos', 'responsabilidade', 'rescisão', 'garantia',
    'confidencialidade', 'arrendamento', 'inquilino', 'senhorio',
    'empregador', 'empregado', 'pagamento', 'compensação', 'lei aplicável',
    'jurisdição', 'política de privacidade',
    // Chinese (pinyin / common terms)
    '合同', '协议', '条款', '条件', '当事人', '义务', '权利',
    '责任', '终止', '保证', '保密', '租赁', '雇主', '雇员',
    '付款', '管辖', '隐私政策',
  ];
  
  const lowerText = text.toLowerCase();
  
  // Count how many legal keywords appear in the text
  const keywordCount = legalKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  
  // Check for common legal document patterns
  const hasLegalPatterns = (
    lowerText.includes('this agreement') ||
    lowerText.includes('this contract') ||
    lowerText.includes('terms of service') ||
    lowerText.includes('terms and conditions') ||
    lowerText.includes('privacy policy') ||
    lowerText.includes('end user license') ||
    lowerText.includes('software license') ||
    lowerText.includes('service agreement') ||
    lowerText.includes('employment agreement') ||
    lowerText.includes('rental agreement') ||
    lowerText.includes('lease agreement') ||
    lowerText.includes('purchase agreement') ||
    lowerText.includes('non-disclosure agreement') ||
    lowerText.includes('confidentiality agreement') ||
    lowerText.includes('partnership agreement') ||
    lowerText.includes('consulting agreement') ||
    lowerText.includes('vendor agreement') ||
    lowerText.includes('master service agreement') ||
    lowerText.includes('statement of work') ||
    lowerText.includes('work order') ||
    lowerText.includes('purchase order') ||
    lowerText.includes('terms of use') ||
    lowerText.includes('user agreement') ||
    lowerText.includes('license terms') ||
    lowerText.includes('subscription agreement') ||
    lowerText.includes('service terms') ||
    lowerText.includes('website terms') ||
    lowerText.includes('app terms') ||
    lowerText.includes('platform terms') ||
    lowerText.includes('privacy notice') ||
    lowerText.includes('data processing') ||
    lowerText.includes('cookie policy')
  );
  
  // Check for legal document structure indicators
  const hasLegalStructure = (
    lowerText.includes('whereas') ||
    lowerText.includes('now therefore') ||
    lowerText.includes('in witness whereof') ||
    lowerText.includes('executed as of') ||
    lowerText.includes('effective as of') ||
    lowerText.includes('signed and agreed') ||
    lowerText.includes('parties agree') ||
    lowerText.includes('subject to the terms') ||
    lowerText.includes('by using') ||
    lowerText.includes('by accessing') ||
    lowerText.includes('you agree to') ||
    lowerText.includes('these terms') ||
    lowerText.includes('this policy') ||
    lowerText.includes('we collect') ||
    lowerText.includes('personal information') ||
    lowerText.includes('data protection') ||
    lowerText.includes('your rights') ||
    lowerText.includes('contact us')
  );
  
  // Check for business/legal context indicators
  const hasBusinessContext = (
    lowerText.includes('company') ||
    lowerText.includes('corporation') ||
    lowerText.includes('llc') ||
    lowerText.includes('inc.') ||
    lowerText.includes('ltd.') ||
    lowerText.includes('business') ||
    lowerText.includes('organization') ||
    lowerText.includes('entity') ||
    lowerText.includes('customer') ||
    lowerText.includes('client') ||
    lowerText.includes('user') ||
    lowerText.includes('subscriber') ||
    lowerText.includes('member')
  );
  
  // If document has legal patterns or structure, it's likely legal
  if (hasLegalPatterns || hasLegalStructure) {
    return true;
  }
  
  // If at least 1 legal keyword is found with business context, consider it legal
  if (keywordCount >= 1 && hasBusinessContext) {
    return true;
  }
  
  // If at least 2 legal keywords are found, consider it a legal document
  return keywordCount >= 2;
}

/**
 * Detect sections in a legal document
 * @param text The document text
 * @returns Array of detected sections
 */
export function detectSections(text: string): Array<{ heading: string; content: string }> {
  if (!text || typeof text !== 'string') {
    return [{ heading: 'Document', content: text || '' }];
  }

  const sections: Array<{ heading: string; content: string }> = [];
  const lines = text.split('\n');
  
  let currentSection = { heading: 'Introduction', content: '' };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      currentSection.content += '\n';
      continue;
    }
    
    // Check if this line looks like a heading
    const isHeading = (
      // Numbered sections (1., 2., etc.)
      /^\d+\.?\s+[A-Z]/.test(line) ||
      // All caps headings
      /^[A-Z\s]{3,}$/.test(line) ||
      // Title case headings
      /^[A-Z][a-z]+(\s+[A-Z][a-z]*)*:?\s*$/.test(line) ||
      // Common section patterns
      /^(TERMS?|CONDITIONS?|PAYMENT|LIABILITY|TERMINATION|CONFIDENTIAL|PRIVACY|DEFINITIONS?|SCOPE|OBLIGATIONS?|WARRANTIES?|INDEMNIFICATION|GOVERNING LAW|DISPUTE|ARBITRATION|FORCE MAJEURE|AMENDMENT|MODIFICATION|ENTIRE AGREEMENT|SEVERABILITY|WAIVER|NOTICES?|ASSIGNMENT|SUCCESSORS?|COUNTERPARTS?|ELECTRONIC SIGNATURES?|HEADINGS?)/i.test(line)
    );
    
    if (isHeading && currentSection.content.trim()) {
      // Save the current section
      sections.push({
        heading: currentSection.heading,
        content: currentSection.content.trim()
      });
      
      // Start a new section
      currentSection = {
        heading: line.replace(/^\d+\.?\s*/, '').replace(/:$/, '').trim(),
        content: ''
      };
    } else {
      // Add to current section content
      currentSection.content += line + '\n';
    }
  }
  
  // Add the last section
  if (currentSection.content.trim()) {
    sections.push({
      heading: currentSection.heading,
      content: currentSection.content.trim()
    });
  }
  
  // If no sections were detected, return the entire text as one section
  if (sections.length === 0) {
    return [{ heading: 'Document', content: text }];
  }
  
  return sections;
}

/**
 * Analyze a contract using AI to provide section-by-section analysis
 * @param text The contract text
 * @returns Promise with contract analysis
 */
export async function analyzeContract(text: string, outputLanguage: string = 'English'): Promise<ContractAnalysis> {
  try {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for analysis');
    }

    if (text.trim().length < 10) {
      throw new Error('Text is too short to analyze meaningfully');
    }
    
    // Check if this appears to be a legal document
    if (!isLegalDocument(text)) {
      throw new Error("The provided text doesn't appear to be a legal document. Please upload or paste a legal agreement, contract, terms document, privacy policy, or other legal text for analysis.");
    }

    // Detect sections
    const detectedSections = detectSections(text);
    
    // Analyze each section with AI
    const sectionAnalyses: SectionAnalysis[] = [];
    
    for (const section of detectedSections) {
      try {
        const analysis = await analyzeSectionWithAI(section.heading, section.content, outputLanguage);
        sectionAnalyses.push({
          ...analysis,
          originalText: section.content
        });
      } catch (error) {
        if (__DEV__) console.error(`Error analyzing section "${section.heading}":`, error);
        // Provide fallback analysis
        sectionAnalyses.push({
          heading: section.heading,
          summary: `This section covers ${section.heading.toLowerCase()}. Please review the original text for details.`,
          confidence: 0.5,
          category: 'Miscellaneous',
          risk: 'medium',
          tooltip: 'AI analysis was not available for this section.',
          originalText: section.content
        });
      }
    }
    
    // Determine overall risk and key findings
    const overallRisk = determineOverallRisk(sectionAnalyses);
    const keyFindings = extractKeyFindings(sectionAnalyses);
    const documentType = await analyzeDocumentType(text);
    
    return {
      sections: sectionAnalyses,
      overallRisk,
      keyFindings,
      documentType
    };
  } catch (error) {
    if (__DEV__) console.error('Error analyzing contract:', error);
    throw error;
  }
}

/**
 * Analyze a single section using AI
 * @param heading Section heading
 * @param content Section content
 * @returns Promise with section analysis
 */
async function analyzeSectionWithAI(heading: string, content: string, outputLanguage: string = 'English'): Promise<Omit<SectionAnalysis, 'originalText'>> {
  const languageNote = outputLanguage !== 'English'
    ? ` Write the summary and tooltip in ${outputLanguage}.`
    : '';

  const messages = [
    {
      role: 'system',
      content: `You are a contract analysis expert. You can analyze legal documents written in ANY language. Analyze the given section and respond with a JSON object containing:
- heading: the section heading
- summary: a plain-language summary (≤ 50 words)${languageNote}
- confidence: confidence score (0.0-1.0)
- category: one of "Termination & Renewal", "Payment & Fees", "Liability & Indemnity", "Confidentiality & Non-Compete", "Miscellaneous"
- risk: "low", "medium", or "high"
- tooltip: brief warning if risk is medium/high (optional)${languageNote}

Example response:
{
  "heading": "Termination",
  "summary": "The contract auto-renews yearly unless either side gives 60 days notice. If you end it, you still owe any unpaid fees.",
  "confidence": 0.92,
  "category": "Termination & Renewal",
  "risk": "medium",
  "tooltip": "Automatic renewals can lock you in; double-check notice period to avoid unintended renewal."
}`
    },
    {
      role: 'user',
      content: `Analyze this contract section:

Heading: ${heading}
Content: ${content}`
    }
  ];
  
  const response = await callAPI(messages);
  
  try {
    // Try to parse JSON response
    const parsed = JSON.parse(response);
    
    // Validate the response structure
    if (!parsed.heading || !parsed.summary || !parsed.category || !parsed.risk) {
      throw new Error('Invalid AI response structure');
    }
    
    return {
      heading: parsed.heading,
      summary: parsed.summary,
      confidence: parsed.confidence || 0.7,
      category: parsed.category,
      risk: parsed.risk,
      tooltip: parsed.tooltip
    };
  } catch (parseError) {
    if (__DEV__) console.error('Error parsing AI response:', parseError);
    
    // Fallback: extract information from text response
    return {
      heading,
      summary: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
      confidence: 0.6,
      category: categorizeSectionByKeywords(heading, content),
      risk: assessRiskByKeywords(content),
      tooltip: undefined
    };
  }
}

/**
 * Categorize section by keywords as fallback
 */
function categorizeSectionByKeywords(heading: string, content: string): SectionCategory {
  const text = (heading + ' ' + content).toLowerCase();
  
  if (text.includes('terminat') || text.includes('renewal') || text.includes('expir')) {
    return 'Termination & Renewal';
  }
  if (text.includes('payment') || text.includes('fee') || text.includes('cost') || text.includes('price')) {
    return 'Payment & Fees';
  }
  if (text.includes('liabilit') || text.includes('indemnif') || text.includes('damages')) {
    return 'Liability & Indemnity';
  }
  if (text.includes('confidential') || text.includes('non-compete') || text.includes('proprietary')) {
    return 'Confidentiality & Non-Compete';
  }
  
  return 'Miscellaneous';
}

/**
 * Assess risk by keywords as fallback
 */
function assessRiskByKeywords(content: string): RiskLevel {
  const text = content.toLowerCase();
  
  const highRiskKeywords = ['unlimited liability', 'automatic renewal', 'no refund', 'irrevocable', 'perpetual'];
  const mediumRiskKeywords = ['penalty', 'breach', 'default', 'terminate', 'indemnify'];
  
  if (highRiskKeywords.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  if (mediumRiskKeywords.some(keyword => text.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Determine overall risk from section analyses
 */
function determineOverallRisk(sections: SectionAnalysis[]): RiskLevel {
  const riskCounts = { high: 0, medium: 0, low: 0 };
  
  sections.forEach(section => {
    riskCounts[section.risk]++;
  });
  
  if (riskCounts.high > 0) return 'high';
  if (riskCounts.medium > sections.length / 2) return 'medium';
  return 'low';
}

/**
 * Extract key findings from section analyses
 */
function extractKeyFindings(sections: SectionAnalysis[]): string[] {
  const findings: string[] = [];
  
  sections.forEach(section => {
    if (section.risk === 'high' && section.tooltip) {
      findings.push(`${section.heading}: ${section.tooltip}`);
    }
  });
  
  // Add general findings
  const highRiskSections = sections.filter(s => s.risk === 'high').length;
  if (highRiskSections > 0) {
    findings.unshift(`${highRiskSections} high-risk section${highRiskSections > 1 ? 's' : ''} identified`);
  }
  
  return findings.slice(0, 5); // Limit to top 5 findings
}

/**
 * Detect the language of a text using AI
 * @param text The text to detect language for
 * @returns Promise with the detected language name (e.g. "English", "Spanish")
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    if (!text || text.trim().length < 20) {
      return 'English';
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a language detection expert. Respond with ONLY the language name in English (e.g. "English", "Spanish", "French", "German", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic", "Russian", "Italian", "Dutch"). Do not include any other text.'
      },
      {
        role: 'user',
        content: `Detect the language of this text:\n\n${text.substring(0, 500)}`
      }
    ];

    const response = await callAPI(messages);
    const lang = response.trim().replace(/["'.]/g, '');

    // Validate the response looks like a language name (1-2 words)
    if (lang.split(/\s+/).length <= 3 && lang.length < 30) {
      return lang;
    }

    return 'English';
  } catch (error) {
    if (__DEV__) console.error('Error detecting language:', error);
    return 'English';
  }
}

/**
 * Simplify legal text with proper validation and formatting
 * @param text The legal text to simplify
 * @param complexityLevel The desired simplification level (1-3)
 * @param outputLanguage The desired output language (default: 'English')
 * @returns Promise with the simplified text
 */
export async function simplifyText(
  text: string, 
  complexityLevel: number = 1,
  outputLanguage: string = 'English'
): Promise<string> {
  try {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for simplification');
    }

    if (text.trim().length < 10) {
      throw new Error('Text is too short to simplify meaningfully');
    }
    
    // Check if this appears to be a legal document BEFORE processing
    if (!isLegalDocument(text)) {
      throw new Error("The provided text doesn't appear to be a legal document. Please upload or paste a legal agreement, contract, terms document, privacy policy, or other legal text for simplification.");
    }

    // Define the complexity level description
    const complexityDescription = 
      complexityLevel === 1 ? 'very simple language suitable for anyone to understand' : 
      complexityLevel === 2 ? 'moderately simple language with some legal terms explained' : 
      'clearer language while preserving important legal details';

    const languageInstruction = outputLanguage !== 'English'
      ? `IMPORTANT: The output MUST be written entirely in ${outputLanguage}.`
      : '';
    
    // Create messages array with proper format and specific instructions for formatting
    const messages = [
      {
        role: 'system',
        content: `You are a legal expert who specializes in translating complex legal language into plain, accessible language. You can read legal documents in ANY language and produce output in the requested language. Your goal is to make legal documents accessible to everyone while preserving the essential meaning and important details. Always respond with clean, well-formatted text using proper paragraphs and clear structure. NEVER use markdown formatting, bullet points, or special characters. Use only plain text with paragraph breaks. ${languageInstruction}`
      },
      {
        role: 'user',
        content: `Please rewrite this legal text using ${complexityDescription}. Make it clear and easy to understand while keeping all the important information. ${outputLanguage !== 'English' ? `Write the output in ${outputLanguage}.` : ''}

CRITICAL FORMATTING REQUIREMENTS:
- Use ONLY plain text with clear paragraphs
- Separate paragraphs with double line breaks
- NO markdown formatting (no **, *, #, [], (), etc.)
- NO bullet points or numbered lists
- NO special characters or symbols
- Write in natural, conversational language
- Organize information logically with clear paragraph breaks
- Do not include any apologies, explanations, or meta-commentary
- Just provide the simplified text directly

Legal text to simplify:

${text}`
      }
    ];
    
    const simplified = await callAPI(messages);
    
    // Check if the API returned a valid simplification
    if (!simplified || simplified.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    // Check for refusal patterns
    const refusalPatterns = [
      'sorry', 'can\'t', 'cannot', 'unable', 'not able', 
      'i cannot', 'i can\'t', 'i\'m sorry', 'apologize'
    ];
    
    const lowerSimplified = simplified.toLowerCase();
    const hasRefusal = refusalPatterns.some(pattern => lowerSimplified.includes(pattern));
    
    if (hasRefusal && simplified.length < 100) {
      throw new Error('The AI service declined to process this text. Please try with a different legal document.');
    }
    
    // Aggressively clean any remaining markdown formatting
    const cleanedText = cleanMarkdownFormatting(simplified);
    
    return cleanedText;
  } catch (error) {
    if (__DEV__) console.error('Error simplifying text:', error);
    throw error; // Don't fall back to mock - let the caller handle the error
  }
}

/**
 * Clean markdown formatting from text - Enhanced version
 * @param text Text that may contain markdown
 * @returns Clean text without markdown
 */
function cleanMarkdownFormatting(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;
  
  // Remove markdown headers (multiple passes for nested headers)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/#{1,6}\s+/g, '');
  
  // Remove bold and italic formatting (multiple patterns)
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, '$1'); // Bold italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
  cleaned = cleaned.replace(/___([^_]+)___/g, '$1'); // Bold italic underscore
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1'); // Bold underscore
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1'); // Italic underscore
  
  // Remove bullet points and list formatting
  cleaned = cleaned.replace(/^\s*[-*+•]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/^\s*[a-zA-Z]\.\s+/gm, '');
  cleaned = cleaned.replace(/^\s*[ivxlcdm]+\.\s+/gmi, '');
  
  // Remove code blocks and inline code
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1');
  
  // Remove blockquotes
  cleaned = cleaned.replace(/^\s*>\s+/gm, '');
  
  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
  
  // Remove strikethrough
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');
  
  // Remove any remaining markdown symbols
  cleaned = cleaned.replace(/[*_`~#]/g, '');
  
  // Remove square brackets and parentheses that might be leftover from links
  cleaned = cleaned.replace(/\[|\]/g, '');
  
  // Clean up extra whitespace while preserving paragraph breaks
  cleaned = cleaned.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Multiple newlines to double newline
  cleaned = cleaned.replace(/^\s+|\s+$/g, ''); // Trim start and end
  
  // Ensure proper paragraph spacing
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
  
  return cleaned;
}

/**
 * Analyze document type
 * @param text The document text to analyze
 * @returns Promise with the document type
 */
export async function analyzeDocumentType(text: string): Promise<string> {
  try {
    // Check if this appears to be a legal document first
    if (!isLegalDocument(text)) {
      return "Unknown Document";
    }
    
    // Create messages array with proper format
    const messages = [
      {
        role: 'user',
        content: `What type of legal document is this? Respond with just the document type (like "Employment Contract", "Rental Agreement", "NDA", etc.):

${text.substring(0, 500)}...`
      }
    ];
    
    const result = await callAPI(messages);
    
    // Clean up the response
    const cleanResult = result.replace(/['"]/g, '').trim();
    
    // If the result seems invalid, try to detect from keywords
    if (cleanResult.toLowerCase().includes("sorry") || 
        cleanResult.toLowerCase().includes("can't") ||
        cleanResult.length > 50) {
      return detectDocumentTypeFromKeywords(text);
    }
    
    return cleanResult;
  } catch (error) {
    if (__DEV__) console.error('Error analyzing document type:', error);
    return detectDocumentTypeFromKeywords(text);
  }
}

/**
 * Detect document type from keywords as fallback
 * @param text Document text
 * @returns Document type
 */
function detectDocumentTypeFromKeywords(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('rental') || lowerText.includes('lease') || lowerText.includes('tenant') || lowerText.includes('landlord')) {
    return 'Rental Agreement';
  }
  if (lowerText.includes('employment') || lowerText.includes('employee') || lowerText.includes('salary') || lowerText.includes('job')) {
    return 'Employment Contract';
  }
  if (lowerText.includes('confidential') || lowerText.includes('non-disclosure') || lowerText.includes('nda')) {
    return 'Non-Disclosure Agreement';
  }
  if (lowerText.includes('license') || lowerText.includes('software') || lowerText.includes('copyright')) {
    return 'License Agreement';
  }
  if (lowerText.includes('service') || lowerText.includes('provider') || lowerText.includes('client')) {
    return 'Service Agreement';
  }
  if (lowerText.includes('purchase') || lowerText.includes('sale') || lowerText.includes('buyer') || lowerText.includes('seller')) {
    return 'Purchase Agreement';
  }
  if (lowerText.includes('terms of service') || lowerText.includes('terms and conditions')) {
    return 'Terms of Service';
  }
  if (lowerText.includes('privacy policy') || lowerText.includes('data protection')) {
    return 'Privacy Policy';
  }
  if (lowerText.includes('partnership') || lowerText.includes('joint venture')) {
    return 'Partnership Agreement';
  }
  if (lowerText.includes('consulting') || lowerText.includes('consultant')) {
    return 'Consulting Agreement';
  }
  
  return 'Legal Document';
}

/**
 * Extract key dates and deadlines from a legal document
 * @param text The document text
 * @returns Promise with array of key dates
 */
export async function extractKeyDates(text: string): Promise<Array<{ label: string; date: string; description?: string }>> {
  try {
    if (!text || text.trim().length < 30) {
      return [];
    }

    const messages = [
      {
        role: 'system',
        content: `You are a legal document analyst. Extract all important dates, deadlines, and time periods from the given legal text. Respond with a JSON array of objects, each containing:
- label: short name for the date (e.g. "Effective Date", "Termination Deadline")
- date: the date or time period as stated in the document
- description: brief explanation of why this date matters (optional)

If no dates are found, return an empty array [].

Example response:
[
  {"label": "Effective Date", "date": "January 1, 2025", "description": "When the agreement takes effect"},
  {"label": "Renewal Deadline", "date": "60 days before expiry", "description": "Notice required to prevent auto-renewal"}
]`
      },
      {
        role: 'user',
        content: `Extract all key dates and deadlines from this legal document:\n\n${text.substring(0, 4000)}`
      }
    ];

    const response = await callAPI(messages);

    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.label && item.date).slice(0, 10);
      }
    } catch {
      if (__DEV__) console.error('Failed to parse key dates response');
    }

    return [];
  } catch (error) {
    if (__DEV__) console.error('Error extracting key dates:', error);
    return [];
  }
}

/**
 * Check rate limits before processing with the exact flow requested
 * @returns Object with allowed status and message
 */
async function checkRateLimits(): Promise<{ allowed: boolean; message: string }> {
  try {
    // Get current user counters
    const counters = await getUserCounters();
    const now = Date.now();
    
    // Reset counters if needed
    let updated = false;
    
    // Reset minute counters if a minute has passed
    if (now - counters.minuteReset >= MINUTE_RESET_MS) {
      counters.scansThisMinute = 0;
      counters.tokensThisMinute = 0;
      counters.minuteReset = now;
      updated = true;
    }
    
    // Reset daily counters if a day has passed
    if (now - counters.dailyReset >= DAY_RESET_MS) {
      counters.scansToday = 0;
      counters.dailyReset = now;
      updated = true;
    }
    
    // Save updated counters if changed
    if (updated) {
      await saveUserCounters(counters);
    }
    
    // Check rate limits in the exact order requested
    if (counters.scansThisMinute >= MAX_SCANS_PER_MINUTE) {
      return { 
        allowed: false, 
        message: "Try again in a moment." 
      };
    }
    
    if (counters.scansToday >= MAX_SCANS_PER_DAY) {
      return { 
        allowed: false, 
        message: "You've used your 5 free scans today." 
      };
    }
    
    // Estimate tokens for this request (will be updated after actual API call)
    const estimatedTokens = 5000; // Conservative estimate for legal document processing
    
    if (counters.tokensThisMinute + estimatedTokens > MAX_TOKENS_PER_MINUTE) {
      return { 
        allowed: false, 
        message: "Please wait..." 
      };
    }
    
    return { allowed: true, message: "" };
  } catch (error) {
    if (__DEV__) console.error('Error checking rate limits:', error);
    // Don't allow the request if there's an error checking limits
    return { allowed: false, message: "Rate limit check failed. Please try again." };
  }
}

/**
 * Update token usage after API call
 * @param tokens Number of tokens used
 */
async function updateTokenUsage(tokens: number): Promise<void> {
  try {
    const counters = await getUserCounters();
    
    // Increment scan counters
    counters.scansThisMinute++;
    counters.scansToday++;
    counters.tokensThisMinute += tokens;
    
    // Save updated counters
    await saveUserCounters(counters);
  } catch (error) {
    if (__DEV__) console.error('Error updating token usage:', error);
  }
}

/**
 * Get user counters from storage
 * @returns User counters object
 */
async function getUserCounters(): Promise<UserCounters> {
  try {
    const countersJson = await AsyncStorage.getItem('user-rate-limits');
    if (countersJson) {
      return JSON.parse(countersJson);
    }
  } catch (error) {
    if (__DEV__) console.error('Error getting user counters:', error);
  }
  
  // Return default counters if none exist
  return {
    scansThisMinute: 0,
    scansToday: 0,
    tokensThisMinute: 0,
    minuteReset: Date.now(),
    dailyReset: Date.now()
  };
}

/**
 * Save user counters to storage
 * @param counters User counters object
 */
async function saveUserCounters(counters: UserCounters): Promise<void> {
  try {
    await AsyncStorage.setItem('user-rate-limits', JSON.stringify(counters));
  } catch (error) {
    if (__DEV__) console.error('Error saving user counters:', error);
  }
}

/**
 * Get current rate limit status for display
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(): Promise<{
  scansToday: number;
  maxScansPerDay: number;
  scansThisMinute: number;
  maxScansPerMinute: number;
}> {
  const counters = await getUserCounters();
  const now = Date.now();
  
  // Reset counters if needed
  if (now - counters.minuteReset >= MINUTE_RESET_MS) {
    counters.scansThisMinute = 0;
    counters.tokensThisMinute = 0;
    counters.minuteReset = now;
  }
  
  if (now - counters.dailyReset >= DAY_RESET_MS) {
    counters.scansToday = 0;
    counters.dailyReset = now;
  }
  
  return {
    scansToday: counters.scansToday,
    maxScansPerDay: MAX_SCANS_PER_DAY,
    scansThisMinute: counters.scansThisMinute,
    maxScansPerMinute: MAX_SCANS_PER_MINUTE,
  };
}
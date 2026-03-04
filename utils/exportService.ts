import { Platform, Share, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { EnhancedDocumentItem } from '@/hooks/useDocumentStore';
import type { ContractAnalysis } from '@/utils/aiService';
import type { Annotation } from '@/hooks/useAnnotationStore';

/**
 * Build a plain-text export of a document including simplified text,
 * original text, and optional AI analysis summary.
 */
function buildExportContent(
  doc: EnhancedDocumentItem,
  annotations?: { simplified: Annotation[]; original: Annotation[] }
): string {
  const lines: string[] = [];

  lines.push(`═══════════════════════════════════════`);
  lines.push(`  ${doc.title}`);
  lines.push(`  Processed: ${doc.date}`);
  if (doc.detectedLanguage && doc.detectedLanguage !== 'English') {
    lines.push(`  Original Language: ${doc.detectedLanguage}`);
  }
  lines.push(`═══════════════════════════════════════`);
  lines.push('');

  // Simplified
  lines.push('── SIMPLIFIED VERSION ──');
  lines.push('');
  lines.push(doc.simplified);
  lines.push('');

  // AI Analysis summary
  if (doc.aiAnalysis) {
    const a = doc.aiAnalysis;
    lines.push('── AI ANALYSIS SUMMARY ──');
    lines.push('');
    lines.push(`Document Type: ${a.documentType}`);
    lines.push(`Overall Risk: ${a.overallRisk.toUpperCase()}`);
    lines.push('');

    if (a.keyFindings.length > 0) {
      lines.push('Key Findings:');
      a.keyFindings.forEach((f) => lines.push(`  • ${f}`));
      lines.push('');
    }

    if (a.sections.length > 0) {
      lines.push('Section Summaries:');
      a.sections.forEach((s) => {
        lines.push(`  [${s.risk.toUpperCase()}] ${s.heading} — ${s.summary}`);
      });
      lines.push('');
    }

    // Key dates if present
    if (doc.keyDates && doc.keyDates.length > 0) {
      lines.push('Key Dates & Deadlines:');
      doc.keyDates.forEach((d) => {
        lines.push(`  • ${d.label}: ${d.date}${d.description ? ` — ${d.description}` : ''}`);
      });
      lines.push('');
    }
  }

  // Annotations
  if (annotations) {
    const allAnnotations = [
      ...annotations.simplified.map((a) => ({ ...a, source: 'Simplified' as const })),
      ...annotations.original.map((a) => ({ ...a, source: 'Original' as const })),
    ];
    if (allAnnotations.length > 0) {
      lines.push('── ANNOTATIONS ──');
      lines.push('');
      allAnnotations.forEach((a) => {
        const text = a.source === 'Simplified'
          ? doc.simplified.slice(a.startOffset, a.endOffset)
          : doc.text.slice(a.startOffset, a.endOffset);
        lines.push(`  [${a.color.toUpperCase()}] (${a.source}) "${text}"`);
        if (a.note) {
          lines.push(`    Note: ${a.note}`);
        }
      });
      lines.push('');
    }
  }

  // Original
  lines.push('── ORIGINAL TEXT ──');
  lines.push('');
  lines.push(doc.text);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('Exported from Legalese GPT');

  return lines.join('\n');
}

/**
 * Sanitise a title for use as a filename.
 */
function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 60);
}

/**
 * Export a document. On native platforms this writes a .txt file and opens
 * the share sheet. On web it falls back to the Share API.
 */
export async function exportDocument(
  doc: EnhancedDocumentItem,
  annotations?: { simplified: Annotation[]; original: Annotation[] }
): Promise<void> {
  const content = buildExportContent(doc, annotations);
  const filename = `${sanitizeFilename(doc.title)}.txt`;

  if (Platform.OS === 'web') {
    // Web: use basic Share API
    try {
      await Share.share({ message: content, title: doc.title });
    } catch {
      Alert.alert('Export', 'Sharing is not available on web.');
    }
    return;
  }

  // Native: write file and share
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    // Fallback to basic Share API
    await Share.share({ message: content, title: doc.title });
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: `Export ${doc.title}`,
    UTI: 'public.plain-text',
  });
}

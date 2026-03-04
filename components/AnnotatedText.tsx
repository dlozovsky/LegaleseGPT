import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Highlighter, Trash2, X, Edit3, Check } from 'lucide-react-native';
import colors, { HighlightColor, highlightColorMap } from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useAnnotationStore, Annotation } from '@/hooks/useAnnotationStore';

interface AnnotatedTextProps {
  title: string;
  content: string;
  documentId: number;
  tab: 'simplified' | 'original';
}

const HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];

/**
 * Split text into segments based on annotations so we can render highlight spans.
 */
function buildSegments(
  text: string,
  annotations: Annotation[]
): Array<{ text: string; annotation?: Annotation }> {
  if (annotations.length === 0) {
    return [{ text }];
  }

  // Sort annotations by startOffset
  const sorted = [...annotations].sort((a, b) => a.startOffset - b.startOffset);

  const segments: Array<{ text: string; annotation?: Annotation }> = [];
  let cursor = 0;

  for (const ann of sorted) {
    // Clamp to valid range
    const start = Math.max(ann.startOffset, cursor);
    const end = Math.min(ann.endOffset, text.length);
    if (start >= end) continue;

    // Plain text before this annotation
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start) });
    }

    segments.push({
      text: text.slice(start, end),
      annotation: ann,
    });

    cursor = end;
  }

  // Remaining text
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
}

export default function AnnotatedText({ title, content, documentId, tab }: AnnotatedTextProps) {
  const { isDarkMode, fontSize } = useThemeStore();
  const { getAnnotations, addAnnotation, updateAnnotation, removeAnnotation } =
    useAnnotationStore();

  const annotations = getAnnotations(documentId, tab);

  // Selection state (simulated via long-press word selection)
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState<HighlightColor>('yellow');

  // View/edit existing annotation
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState<HighlightColor>('yellow');
  const [isEditing, setIsEditing] = useState(false);

  const themeColors = isDarkMode
    ? {
        background: colors.darkSecondary,
        title: colors.darkText,
        content: colors.darkText,
        border: colors.darkBorder,
        modalBg: colors.darkSecondary,
        modalOverlay: 'rgba(0,0,0,0.6)',
      }
    : {
        background: 'white',
        title: colors.text,
        content: colors.text,
        border: colors.border,
        modalBg: 'white',
        modalOverlay: 'rgba(0,0,0,0.4)',
      };

  const getFontSize = () => {
    switch (fontSize) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const segments = useMemo(() => buildSegments(content, annotations), [content, annotations]);

  // Build word boundaries for selection
  const wordBoundaries = useMemo(() => {
    const boundaries: Array<{ start: number; end: number }> = [];
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      boundaries.push({ start: match.index, end: match.index + match[0].length });
    }
    return boundaries;
  }, [content]);

  const handleWordLongPress = useCallback(
    (wordStart: number, wordEnd: number) => {
      // Check if tapping on an existing annotation
      const existing = annotations.find(
        (a) => wordStart >= a.startOffset && wordEnd <= a.endOffset
      );
      if (existing) {
        setSelectedAnnotation(existing);
        setEditNote(existing.note);
        setEditColor(existing.color);
        setIsEditing(false);
        setShowViewModal(true);
        return;
      }

      setSelectionStart(wordStart);
      setSelectionEnd(wordEnd);
      setNewNote('');
      setNewColor('yellow');
      setShowCreateModal(true);
    },
    [annotations]
  );

  const handleAnnotationTap = useCallback((ann: Annotation) => {
    setSelectedAnnotation(ann);
    setEditNote(ann.note);
    setEditColor(ann.color);
    setIsEditing(false);
    setShowViewModal(true);
  }, []);

  const handleCreate = () => {
    if (selectionStart == null || selectionEnd == null) return;
    addAnnotation({
      documentId,
      tab,
      startOffset: selectionStart,
      endOffset: selectionEnd,
      color: newColor,
      note: newNote,
    });
    setShowCreateModal(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleSaveEdit = () => {
    if (!selectedAnnotation) return;
    updateAnnotation(selectedAnnotation.id, { note: editNote, color: editColor });
    setShowViewModal(false);
    setSelectedAnnotation(null);
  };

  const handleDelete = () => {
    if (!selectedAnnotation) return;
    removeAnnotation(selectedAnnotation.id);
    setShowViewModal(false);
    setSelectedAnnotation(null);
  };

  // Render a text segment, potentially highlighted
  const renderSegment = (
    seg: { text: string; annotation?: Annotation },
    index: number
  ) => {
    if (seg.annotation) {
      const colorInfo = highlightColorMap[seg.annotation.color];
      return (
        <Text
          key={index}
          style={[
            {
              backgroundColor: isDarkMode ? colorInfo.bg + '40' : colorInfo.bgLight,
              borderRadius: 2,
              fontSize: getFontSize(),
              lineHeight: 22,
              color: themeColors.content,
            },
          ]}
          onPress={() => handleAnnotationTap(seg.annotation!)}
        >
          {seg.text}
        </Text>
      );
    }

    // Render plain text with word-level long-press
    return renderPlainWords(seg.text, index);
  };

  const renderPlainWords = (text: string, segIndex: number) => {
    // Split the text into tokens (words + whitespace)
    const tokens = text.split(/(\s+)/);
    let offset = 0;

    // Find the absolute position of this segment in the content
    let absOffset = 0;
    for (const seg of segments) {
      if (seg === segments[segIndex] || segIndex < 0) break;
      absOffset += seg.text.length;
      // We need the index from the segments array to match
    }
    // Recalculate absolute offset by finding the segment
    absOffset = 0;
    for (let i = 0; i < segIndex; i++) {
      absOffset += segments[i].text.length;
    }

    return tokens.map((token, tokenIdx) => {
      const tokenStart = absOffset + offset;
      const tokenEnd = tokenStart + token.length;
      offset += token.length;

      if (/^\s+$/.test(token)) {
        return (
          <Text
            key={`${segIndex}-${tokenIdx}`}
            style={{ fontSize: getFontSize(), lineHeight: 22, color: themeColors.content }}
          >
            {token}
          </Text>
        );
      }

      return (
        <Text
          key={`${segIndex}-${tokenIdx}`}
          style={{ fontSize: getFontSize(), lineHeight: 22, color: themeColors.content }}
          onLongPress={() => handleWordLongPress(tokenStart, tokenEnd)}
        >
          {token}
        </Text>
      );
    });
  };

  const renderColorPicker = (
    selected: HighlightColor,
    onSelect: (c: HighlightColor) => void
  ) => (
    <View style={styles.colorPicker}>
      {HIGHLIGHT_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          style={[
            styles.colorOption,
            { backgroundColor: highlightColorMap[c].bg },
            selected === c && styles.colorOptionSelected,
          ]}
          onPress={() => onSelect(c)}
        />
      ))}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: themeColors.border,
          backgroundColor: themeColors.background,
        },
      ]}
    >
      <View
        style={[
          styles.titleBar,
          {
            backgroundColor: isDarkMode ? colors.darkBackground : colors.secondary,
            borderBottomColor: themeColors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: themeColors.title }]}>{title}</Text>
        <Highlighter
          size={16}
          color={isDarkMode ? colors.darkPrimary : colors.primary}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.contentWrap} selectable>
          {segments.map((seg, i) => renderSegment(seg, i))}
        </Text>
        <Text style={[styles.hint, { color: isDarkMode ? colors.darkTextLight : colors.textLight }]}>
          Long-press a word to annotate
        </Text>
      </ScrollView>

      {/* Create Annotation Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.modalBg, borderColor: themeColors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? colors.darkText : colors.text }]}>
                Add Annotation
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={20} color={isDarkMode ? colors.darkTextLight : colors.textLight} />
              </TouchableOpacity>
            </View>

            {selectionStart != null && selectionEnd != null && (
              <View style={[styles.selectedTextContainer, { backgroundColor: isDarkMode ? colors.darkBackground : colors.secondary, borderColor: themeColors.border }]}>
                <Text style={[styles.selectedTextLabel, { color: isDarkMode ? colors.darkTextLight : colors.textLight }]}>
                  Selected text:
                </Text>
                <Text style={[styles.selectedText, { color: isDarkMode ? colors.darkText : colors.text }]} numberOfLines={2}>
                  "{content.slice(selectionStart, selectionEnd)}"
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.text }]}>Color</Text>
            {renderColorPicker(newColor, setNewColor)}

            <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.text }]}>Note (optional)</Text>
            <TextInput
              style={[styles.noteInput, { color: isDarkMode ? colors.darkText : colors.text, borderColor: themeColors.border, backgroundColor: isDarkMode ? colors.darkBackground : colors.secondary }]}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Add a note..."
              placeholderTextColor={isDarkMode ? colors.darkTextLight : colors.textLight}
              multiline
            />

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary }]}
              onPress={handleCreate}
            >
              <Check size={18} color="white" />
              <Text style={styles.createButtonText}>Add Highlight</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View / Edit Annotation Modal */}
      <Modal visible={showViewModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.modalBg, borderColor: themeColors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? colors.darkText : colors.text }]}>
                {isEditing ? 'Edit Annotation' : 'Annotation'}
              </Text>
              <TouchableOpacity onPress={() => { setShowViewModal(false); setIsEditing(false); }}>
                <X size={20} color={isDarkMode ? colors.darkTextLight : colors.textLight} />
              </TouchableOpacity>
            </View>

            {selectedAnnotation && (
              <View style={[styles.selectedTextContainer, { backgroundColor: isDarkMode ? colors.darkBackground : colors.secondary, borderColor: themeColors.border }]}>
                <Text style={[styles.selectedText, { color: isDarkMode ? colors.darkText : colors.text }]} numberOfLines={3}>
                  "{content.slice(selectedAnnotation.startOffset, selectedAnnotation.endOffset)}"
                </Text>
              </View>
            )}

            {isEditing ? (
              <>
                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.text }]}>Color</Text>
                {renderColorPicker(editColor, setEditColor)}

                <Text style={[styles.label, { color: isDarkMode ? colors.darkText : colors.text }]}>Note</Text>
                <TextInput
                  style={[styles.noteInput, { color: isDarkMode ? colors.darkText : colors.text, borderColor: themeColors.border, backgroundColor: isDarkMode ? colors.darkBackground : colors.secondary }]}
                  value={editNote}
                  onChangeText={setEditNote}
                  placeholder="Add a note..."
                  placeholderTextColor={isDarkMode ? colors.darkTextLight : colors.textLight}
                  multiline
                />

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary }]}
                    onPress={handleSaveEdit}
                  >
                    <Check size={18} color="white" />
                    <Text style={styles.createButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {selectedAnnotation?.note ? (
                  <View style={styles.noteDisplay}>
                    <Text style={[styles.noteDisplayLabel, { color: isDarkMode ? colors.darkTextLight : colors.textLight }]}>Note:</Text>
                    <Text style={[styles.noteDisplayText, { color: isDarkMode ? colors.darkText : colors.text }]}>
                      {selectedAnnotation.note}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.viewActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: isDarkMode ? colors.darkPrimary : colors.primary }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Edit3 size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} />
                    <Text style={[styles.actionButtonText, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    onPress={handleDelete}
                  >
                    <Trash2 size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentWrap: {
    padding: 16,
    flexWrap: 'wrap',
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 12,
    fontStyle: 'italic',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      web: { maxHeight: '80%' as any },
      default: {},
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedTextContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectedTextLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noteDisplay: {
    marginBottom: 16,
  },
  noteDisplayLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noteDisplayText: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HighlightColor } from '@/constants/colors';

export interface Annotation {
  id: string;
  documentId: number;
  /** Which tab the annotation belongs to */
  tab: 'simplified' | 'original';
  startOffset: number;
  endOffset: number;
  color: HighlightColor;
  note: string;
  createdAt: string; // ISO timestamp
}

interface AnnotationState {
  /** All annotations keyed by a compound key "documentId:tab" */
  annotations: Record<string, Annotation[]>;

  getAnnotations: (documentId: number, tab: 'simplified' | 'original') => Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => Annotation;
  updateAnnotation: (id: string, updates: Partial<Pick<Annotation, 'color' | 'note'>>) => void;
  removeAnnotation: (id: string) => void;
  removeAllForDocument: (documentId: number) => void;
}

function makeKey(documentId: number, tab: string): string {
  return `${documentId}:${tab}`;
}

export const useAnnotationStore = create<AnnotationState>()(
  persist(
    (set, get) => ({
      annotations: {},

      getAnnotations: (documentId, tab) => {
        const key = makeKey(documentId, tab);
        return get().annotations[key] ?? [];
      },

      addAnnotation: (partial) => {
        const annotation: Annotation = {
          ...partial,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          createdAt: new Date().toISOString(),
        };
        const key = makeKey(partial.documentId, partial.tab);

        set((state) => ({
          annotations: {
            ...state.annotations,
            [key]: [...(state.annotations[key] ?? []), annotation],
          },
        }));

        return annotation;
      },

      updateAnnotation: (id, updates) => {
        set((state) => {
          const next: Record<string, Annotation[]> = {};
          for (const [key, list] of Object.entries(state.annotations)) {
            next[key] = list.map((a) => (a.id === id ? { ...a, ...updates } : a));
          }
          return { annotations: next };
        });
      },

      removeAnnotation: (id) => {
        set((state) => {
          const next: Record<string, Annotation[]> = {};
          for (const [key, list] of Object.entries(state.annotations)) {
            next[key] = list.filter((a) => a.id !== id);
          }
          return { annotations: next };
        });
      },

      removeAllForDocument: (documentId) => {
        set((state) => {
          const next: Record<string, Annotation[]> = {};
          for (const [key, list] of Object.entries(state.annotations)) {
            if (!key.startsWith(`${documentId}:`)) {
              next[key] = list;
            }
          }
          return { annotations: next };
        });
      },
    }),
    {
      name: 'annotation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

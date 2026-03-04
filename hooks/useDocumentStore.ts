import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DocumentItem } from '@/constants/mockData';
import { ContractAnalysis } from '@/utils/aiService';

// Key date extracted from a document
export interface KeyDate {
  label: string;
  date: string;
  description?: string;
}

// Extended document item with AI analysis
export interface EnhancedDocumentItem extends DocumentItem {
  aiAnalysis?: ContractAnalysis;
  hasAiAnalysis?: boolean;
  keyDates?: KeyDate[];
}

interface DocumentState {
  history: EnhancedDocumentItem[];
  saved: EnhancedDocumentItem[];
  historySearchQuery: string;
  savedSearchQuery: string;
  addToHistory: (document: EnhancedDocumentItem) => void;
  addToSaved: (document: EnhancedDocumentItem) => void;
  removeFromHistory: (id: number) => void;
  removeFromSaved: (id: number) => void;
  clearAllHistory: () => void;
  getDocument: (id: string) => EnhancedDocumentItem | undefined;
  setHistorySearchQuery: (query: string) => void;
  setSavedSearchQuery: (query: string) => void;
  getFilteredHistory: () => EnhancedDocumentItem[];
  getFilteredSaved: () => EnhancedDocumentItem[];
  toggleFavorite: (document: EnhancedDocumentItem) => void;
  updateDocumentWithAI: (id: number, aiAnalysis: ContractAnalysis) => void;
  updateDocumentKeyDates: (id: number, keyDates: KeyDate[]) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      history: [],
      saved: [],
      historySearchQuery: '',
      savedSearchQuery: '',
      addToHistory: (document) => {
        // Read saveHistory preference directly from theme store without
        // a fragile runtime require() – the import is at the top of this file.
        const themeStore = (require('@/hooks/useThemeStore') as typeof import('@/hooks/useThemeStore')).useThemeStore;
        const { saveHistory } = themeStore.getState();
        if (saveHistory !== false) {
          set((state) => ({
            history: [document, ...state.history]
          }));
        }
      },
      addToSaved: (document) => set((state) => ({
        saved: [document, ...state.saved]
      })),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((doc) => doc.id !== id)
      })),
      removeFromSaved: (id) => set((state) => ({
        saved: state.saved.filter((doc) => doc.id !== id)
      })),
      clearAllHistory: () => set({ history: [] }),
      getDocument: (id) => {
        const state = get();
        // First check in saved documents
        const savedDoc = state.saved.find(doc => doc.id.toString() === id);
        if (savedDoc) return savedDoc;
        
        // Then check in history
        const historyDoc = state.history.find(doc => doc.id.toString() === id);
        return historyDoc;
      },
      setHistorySearchQuery: (query) => set({ historySearchQuery: query }),
      setSavedSearchQuery: (query) => set({ savedSearchQuery: query }),
      getFilteredHistory: () => {
        const { history, historySearchQuery } = get();
        if (!historySearchQuery.trim()) return history;
        const q = historySearchQuery.toLowerCase();
        return history.filter(doc => 
          doc.title.toLowerCase().includes(q) || 
          doc.text.toLowerCase().includes(q) ||
          doc.simplified.toLowerCase().includes(q)
        );
      },
      getFilteredSaved: () => {
        const { saved, savedSearchQuery } = get();
        if (!savedSearchQuery.trim()) return saved;
        const q = savedSearchQuery.toLowerCase();
        return saved.filter(doc => 
          doc.title.toLowerCase().includes(q) || 
          doc.text.toLowerCase().includes(q) ||
          doc.simplified.toLowerCase().includes(q)
        );
      },
      toggleFavorite: (document) => {
        const state = get();
        const isSaved = state.saved.some(doc => doc.id === document.id);
        
        if (isSaved) {
          // Remove from saved
          set((state) => ({
            saved: state.saved.filter((doc) => doc.id !== document.id)
          }));
        } else {
          // Add to saved
          set((state) => ({
            saved: [document, ...state.saved]
          }));
        }
      },
      updateDocumentWithAI: (id, aiAnalysis) => {
        set((state) => ({
          history: state.history.map(doc => 
            doc.id === id 
              ? { ...doc, aiAnalysis, hasAiAnalysis: true }
              : doc
          ),
          saved: state.saved.map(doc => 
            doc.id === id 
              ? { ...doc, aiAnalysis, hasAiAnalysis: true }
              : doc
          )
        }));
      },
      updateDocumentKeyDates: (id, keyDates) => {
        set((state) => ({
          history: state.history.map(doc =>
            doc.id === id ? { ...doc, keyDates } : doc
          ),
          saved: state.saved.map(doc =>
            doc.id === id ? { ...doc, keyDates } : doc
          )
        }));
      }
    }),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
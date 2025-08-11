import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DocumentItem } from '@/constants/mockData';
import { ContractAnalysis } from '@/utils/aiService';

// Extended document item with AI analysis
export interface EnhancedDocumentItem extends DocumentItem {
  aiAnalysis?: ContractAnalysis;
  hasAiAnalysis?: boolean;
}

interface DocumentState {
  history: EnhancedDocumentItem[];
  saved: EnhancedDocumentItem[];
  searchQuery: string;
  addToHistory: (document: EnhancedDocumentItem) => void;
  addToSaved: (document: EnhancedDocumentItem) => void;
  removeFromHistory: (id: number) => void;
  removeFromSaved: (id: number) => void;
  clearAllHistory: () => void;
  getDocument: (id: string) => EnhancedDocumentItem | undefined;
  setSearchQuery: (query: string) => void;
  getFilteredHistory: () => EnhancedDocumentItem[];
  getFilteredSaved: () => EnhancedDocumentItem[];
  toggleFavorite: (document: EnhancedDocumentItem) => void;
  updateDocumentWithAI: (id: number, aiAnalysis: ContractAnalysis) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      history: [],
      saved: [],
      searchQuery: '',
      addToHistory: (document) => {
        const { saveHistory } = require('./useThemeStore').useThemeStore.getState();
        if (saveHistory) {
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
      setSearchQuery: (query) => set({ searchQuery: query }),
      getFilteredHistory: () => {
        const { history, searchQuery } = get();
        if (!searchQuery.trim()) return history;
        
        return history.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          doc.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.simplified.toLowerCase().includes(searchQuery.toLowerCase())
        );
      },
      getFilteredSaved: () => {
        const { saved, searchQuery } = get();
        if (!searchQuery.trim()) return saved;
        
        return saved.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          doc.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.simplified.toLowerCase().includes(searchQuery.toLowerCase())
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
      }
    }),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
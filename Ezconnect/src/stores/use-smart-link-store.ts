import { create } from 'zustand';

export type SmartLinkSuggestion = {
  conversationId: string;
  contactId: string;
  contactName: string;
  confidence: number; // 0.0Ã¢â‚¬â€œ1.0
  reasons: string[];
};

export type SmartLinkState = {
  pendingSuggestions: SmartLinkSuggestion[];

  // Actions
  addSuggestion: (suggestion: SmartLinkSuggestion) => void;
  acceptSuggestion: (conversationId: string, contactId: string) => Promise<void>;
  rejectSuggestion: (conversationId: string, contactId: string) => void;
};

export const useSmartLinkStore = create<SmartLinkState>((set, get) => ({
  pendingSuggestions: [],

  addSuggestion: (suggestion) => {
    set((state) => ({
      pendingSuggestions: [...state.pendingSuggestions, suggestion].sort((a, b) => b.confidence - a.confidence)
    }));
  },

  acceptSuggestion: async (conversationId, contactId) => {
    // Stub: Save to DB as linkType: 'confirmed'
    set((state) => ({
      pendingSuggestions: state.pendingSuggestions.filter(
        s => !(s.conversationId === conversationId && s.contactId === contactId)
      )
    }));
  },

  rejectSuggestion: (conversationId, contactId) => {
    // Stub: Log rejection, remove from list
    set((state) => ({
      pendingSuggestions: state.pendingSuggestions.filter(
        s => !(s.conversationId === conversationId && s.contactId === contactId)
      )
    }));
  }
}));

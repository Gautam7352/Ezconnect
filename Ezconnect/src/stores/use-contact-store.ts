import { create } from 'zustand';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { contacts, conversations, contactConversations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { ContactRow, ConversationRow } from '@/types/domain';

interface ContactStore {
  contacts: ContactRow[];
  searchQuery: string;
  activeContact: ContactRow | null;
  conversations: ConversationRow[];
  setSearchQuery: (query: string) => void;
  searchContacts: (query: string) => Promise<void>;
  loadContact: (id: string) => Promise<void>;
  loadConversations: (contactId: string) => Promise<void>;
}

export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],
  searchQuery: '',
  activeContact: null,
  conversations: [],

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchContacts: async (query: string) => {
    try {
      let results;
      if (!query.trim()) {
        results = await db.select().from(contacts).limit(50);
      } else {
        // SQLite FTS5 query using raw SQL mapped back to drizzle table
        results = await db.select().from(contacts).where(
          sql`${contacts}.rowid IN (SELECT rowid FROM contacts_fts WHERE contacts_fts MATCH ${query} ORDER BY rank LIMIT 50)`
        );
      }
      set({ contacts: results });
    } catch (e) {
      console.error('Failed to search contacts:', e);
    }
  },

  loadContact: async (id: string) => {
    try {
      const result = await db.select().from(contacts).where(eq(contacts.id, id));
      set({ activeContact: result.length > 0 ? result[0] : null });
    } catch (e) {
      console.error('Failed to load contact:', e);
    }
  },

  loadConversations: async (contactId: string) => {
    try {
      const results = await db
        .select({ conversation: conversations })
        .from(conversations)
        .innerJoin(contactConversations, eq(conversations.id, contactConversations.conversationId))
        .where(eq(contactConversations.contactId, contactId));
      
      set({ conversations: results.map((r) => r.conversation) });
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  },
}));

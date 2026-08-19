import { create } from 'zustand';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { contacts, conversations } from '@/db/schema'; // Assuming schema exists
import { eq } from 'drizzle-orm';

interface Contact {
  id: string;
  name: string;
  phone: string;
  [key: string]: any;
}

interface Conversation {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}

interface ContactStore {
  contacts: Contact[];
  searchQuery: string;
  activeContact: Contact | null;
  conversations: Conversation[];
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
        // SQLite FTS5 query
        results = await db.all(sql`SELECT * FROM contacts_fts WHERE contacts_fts MATCH ${query} ORDER BY rank LIMIT 50`);
        // If FTS virtual table not available in typed db, standard drizzle:
        // results = await db.select().from(contacts).where(sql`contacts MATCH ${query}`);
      }
      set({ contacts: results as Contact[] });
    } catch (e) {
      console.error('Failed to search contacts:', e);
    }
  },

  loadContact: async (id: string) => {
    try {
      const result = await db.select().from(contacts).where(eq(contacts.id, id)).get();
      set({ activeContact: result as Contact | null });
    } catch (e) {
      console.error('Failed to load contact:', e);
    }
  },

  loadConversations: async (contactId: string) => {
    try {
      const results = await db.select().from(conversations).where(eq(conversations.contactId, contactId));
      set({ conversations: results as Conversation[] });
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  },
}));

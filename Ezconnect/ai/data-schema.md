> Added 2026-08-20 — initial definition

# Drizzle ORM Data Schema

This is the single source of truth for the local database schema using `expo-sqlite` v14 and Drizzle ORM.

## File Locations
- **Schema**: `src/db/schema.ts`
- **DB Singleton**: `src/db/index.ts`
- **Migrations**: `src/db/migrations/`
- **Config**: `drizzle.config.ts` (project root)

## 1. Tables (`src/db/schema.ts`)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ----------------------------------------------------------------------
// Personas: The user's own profile cards
// ----------------------------------------------------------------------
export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(), // uuid
  displayName: text('display_name').notNull(),
  headline: text('headline'),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  avatarUri: text('avatar_uri'), // local file:// URI
  customLinks: text('custom_links'), // JSON: Array<{label: string, url: string}>
  isActive: integer('is_active').notNull().default(0), // 1 = active
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(), // unix ms
  updatedAt: integer('updated_at').notNull(),
});

// ----------------------------------------------------------------------
// Events: Meetups, conferences, hackathons
// ----------------------------------------------------------------------
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  venue: text('venue'),
  eventDate: integer('event_date'), // unix ms
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ----------------------------------------------------------------------
// Contacts: Profiles received from other people
// ----------------------------------------------------------------------
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  eventId: text('event_id').references(() => events.id),
  displayName: text('display_name').notNull(),
  headline: text('headline'),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  avatarUri: text('avatar_uri'),
  customLinks: text('custom_links'), // JSON
  exchangeMethod: text('exchange_method').notNull(), // 'BLE' | 'NFC' | 'QR' | 'MANUAL'
  exchangedAt: integer('exchanged_at').notNull(),
  notes: text('notes'),
  isFavorite: integer('is_favorite').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ----------------------------------------------------------------------
// Conversations: Recorded & transcribed audio
// ----------------------------------------------------------------------
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  eventId: text('event_id').references(() => events.id),
  audioUri: text('audio_uri'), // local file path, null if deleted
  durationSeconds: integer('duration_seconds').notNull().default(0),
  status: text('status').notNull(), // 'recording' | 'processing' | 'done' | 'failed'
  transcriptRaw: text('transcript_raw'), // fast STT
  transcriptEnhanced: text('transcript_enhanced'), // whisper.rn
  transcriptCloud: text('transcript_cloud'),
  summary: text('summary'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ----------------------------------------------------------------------
// ConversationEntities: Extracted entities from transcripts
// ----------------------------------------------------------------------
export const conversationEntities = sqliteTable('conversation_entities', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  type: text('type').notNull(), // 'person' | 'topic' | 'technology' | 'action_item'
  value: text('value').notNull(),
  confidence: real('confidence').notNull().default(1.0),
  createdAt: integer('created_at').notNull(),
});

// ----------------------------------------------------------------------
// ContactConversations: Link between contacts and conversations (M:M)
// ----------------------------------------------------------------------
export const contactConversations = sqliteTable('contact_conversations', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  linkType: text('link_type').notNull(), // 'manual' | 'suggested' | 'confirmed'
  createdAt: integer('created_at').notNull(),
});
```

## 2. Relations (`src/db/schema.ts`)

```typescript
export const eventsRelations = relations(events, ({ many }) => ({
  contacts: many(contacts),
  conversations: many(conversations),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  event: one(events, {
    fields: [contacts.eventId],
    references: [events.id],
  }),
  contactConversations: many(contactConversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  event: one(events, {
    fields: [conversations.eventId],
    references: [events.id],
  }),
  entities: many(conversationEntities),
  contactConversations: many(contactConversations),
}));

export const conversationEntitiesRelations = relations(conversationEntities, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationEntities.conversationId],
    references: [conversations.id],
  }),
}));

export const contactConversationsRelations = relations(contactConversations, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactConversations.contactId],
    references: [contacts.id],
  }),
  conversation: one(conversations, {
    fields: [contactConversations.conversationId],
    references: [conversations.id],
  }),
}));
```

## 3. FTS5 Virtual Tables & Triggers

To be executed during database initialization in `src/db/index.ts` via `db.execAsync()`.

```sql
-- Contacts FTS5
CREATE VIRTUAL TABLE IF NOT EXISTS contacts_fts USING fts5(
  display_name,
  headline,
  company,
  notes,
  content='contacts',
  tokenize='unicode61'
);

CREATE TRIGGER IF NOT EXISTS contacts_fts_ai AFTER INSERT ON contacts BEGIN
  INSERT INTO contacts_fts(rowid, display_name, headline, company, notes)
  VALUES (new.rowid, new.display_name, new.headline, new.company, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS contacts_fts_au AFTER UPDATE ON contacts BEGIN
  DELETE FROM contacts_fts WHERE rowid = old.rowid;
  INSERT INTO contacts_fts(rowid, display_name, headline, company, notes)
  VALUES (new.rowid, new.display_name, new.headline, new.company, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS contacts_fts_ad AFTER DELETE ON contacts BEGIN
  DELETE FROM contacts_fts WHERE rowid = old.rowid;
END;

-- Conversations FTS5
CREATE VIRTUAL TABLE IF NOT EXISTS conversations_fts USING fts5(
  transcript_enhanced,
  transcript_raw,
  summary,
  content='conversations',
  tokenize='unicode61'
);

CREATE TRIGGER IF NOT EXISTS conversations_fts_ai AFTER INSERT ON conversations BEGIN
  INSERT INTO conversations_fts(rowid, transcript_enhanced, transcript_raw, summary)
  VALUES (new.rowid, new.transcript_enhanced, new.transcript_raw, new.summary);
END;

CREATE TRIGGER IF NOT EXISTS conversations_fts_au AFTER UPDATE ON conversations BEGIN
  DELETE FROM conversations_fts WHERE rowid = old.rowid;
  INSERT INTO conversations_fts(rowid, transcript_enhanced, transcript_raw, summary)
  VALUES (new.rowid, new.transcript_enhanced, new.transcript_raw, new.summary);
END;

CREATE TRIGGER IF NOT EXISTS conversations_fts_ad AFTER DELETE ON conversations BEGIN
  DELETE FROM conversations_fts WHERE rowid = old.rowid;
END;
```

## 4. Initialization Pattern (`src/db/index.ts`)

```typescript
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';

// Open DB synchronously
const expoDb = openDatabaseSync('ezconnect.db', { enableChangeListener: true });

// Execute FTS5 setup
expoDb.execSync(`...FTS5 SQL from above...`);

// Export Drizzle instance
export const db = drizzle(expoDb, { schema });

// Export migration hook for the app root
export function useDbMigrations() {
  return useMigrations(db, migrations);
}
```

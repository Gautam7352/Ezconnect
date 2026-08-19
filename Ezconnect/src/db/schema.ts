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

// ----------------------------------------------------------------------
// Relations
// ----------------------------------------------------------------------

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

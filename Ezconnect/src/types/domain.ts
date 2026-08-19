export type ExchangeMethod = 'BLE' | 'NFC' | 'QR' | 'MANUAL';
export type ConversationStatus = 'recording' | 'processing' | 'done' | 'failed';
export type EntityType = 'person' | 'topic' | 'technology' | 'action_item';
export type LinkType = 'manual' | 'suggested' | 'confirmed';

export type CustomLink = {
  label: string;
  url: string;
};

import * as schema from '@/db/schema';

// Raw Rows as they come from the DB (with stringified JSON for customLinks)
export type PersonaRow = typeof schema.personas.$inferSelect;
export type PersonaInsert = typeof schema.personas.$inferInsert;

export type EventRow = typeof schema.events.$inferSelect;
export type EventInsert = typeof schema.events.$inferInsert;

export type ContactRow = typeof schema.contacts.$inferSelect;
export type ContactInsert = typeof schema.contacts.$inferInsert;

export type ConversationRow = typeof schema.conversations.$inferSelect;
export type ConversationInsert = typeof schema.conversations.$inferInsert;

export type ConversationEntityRow = typeof schema.conversationEntities.$inferSelect;
export type ConversationEntityInsert = typeof schema.conversationEntities.$inferInsert;

export type ContactConversationRow = typeof schema.contactConversations.$inferSelect;
export type ContactConversationInsert = typeof schema.contactConversations.$inferInsert;

// Hydrated / Parsed Types
export type Persona = Omit<PersonaRow, 'customLinks'> & {
  customLinks: CustomLink[] | null;
};

export type Contact = Omit<ContactRow, 'customLinks'> & {
  customLinks: CustomLink[] | null;
};

export type ConversationWithEntities = ConversationRow & {
  entities: ConversationEntityRow[];
};

export type ContactWithConversations = Contact & {
  conversations: ConversationRow[];
};

// BLE GATT Payload
export type BLEExchangePayload = {
  v: 1; // protocol version
  appId: 'com.ezconnect.app';
  profile: {
    displayName: string;
    headline?: string;
    company?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    customLinks?: CustomLink[];
    avatarUrl?: string; // remote URL if hosted, omitted if local file
  };
  exchangedAt: number; // unix ms
};

/**
 * Converts a Persona object to a vCard 3.0 string for NFC sharing.
 */
export function buildVCard(persona: Persona): string {
  let vcard = `BEGIN:VCARD\r\nVERSION:3.0\r\n`;
  vcard += `FN:${persona.displayName}\r\n`;
  if (persona.company) vcard += `ORG:${persona.company}\r\n`;
  if (persona.headline) vcard += `TITLE:${persona.headline}\r\n`;
  if (persona.phone) vcard += `TEL;TYPE=CELL:${persona.phone}\r\n`;
  if (persona.email) vcard += `EMAIL;TYPE=WORK:${persona.email}\r\n`;
  if (persona.linkedinUrl) vcard += `URL;TYPE=LinkedIn:${persona.linkedinUrl}\r\n`;
  if (persona.githubUrl) vcard += `URL;TYPE=GitHub:${persona.githubUrl}\r\n`;
  if (persona.portfolioUrl) vcard += `URL;TYPE=Portfolio:${persona.portfolioUrl}\r\n`;
  vcard += `END:VCARD\r\n`;
  return vcard;
}

// Search Results
export type SearchResult = {
  type: 'contact' | 'conversation';
  id: string;
  snippet: string; // FTS5 highlight snippet containing matched terms
  rank: number;
};

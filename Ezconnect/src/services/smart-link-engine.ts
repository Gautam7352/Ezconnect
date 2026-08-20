import type { ContactRow, ConversationRow } from '@/types/domain';

export type LinkSuggestion = {
  contactId: string;
  conversationId: string;
  confidence: number;
  reason: string;
};

/**
 * Heuristic algorithm to suggest linking contacts to conversations.
 * It uses time proximity (exchanged around the same time as conversation)
 * and name matching within the transcript.
 */
export function suggestLinks(
  contacts: ContactRow[],
  conversations: ConversationRow[]
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  // time proximity threshold: 1 hour (3600000 ms)
  const TIME_THRESHOLD_MS = 60 * 60 * 1000;
  
  for (const conv of conversations) {
    for (const contact of contacts) {
      let score = 0;
      let reasons: string[] = [];
      
      // 1. Time proximity
      if (conv.createdAt && contact.exchangedAt) {
        const timeDiff = Math.abs(conv.createdAt - contact.exchangedAt);
        if (timeDiff < TIME_THRESHOLD_MS) {
          // Score based on how close they are in time (up to 0.5)
          const proximityScore = 0.5 * (1 - timeDiff / TIME_THRESHOLD_MS);
          score += proximityScore;
          reasons.push('Time proximity');
        }
      }
      
      // 2. Name match in transcript
      const transcript = conv.transcriptEnhanced || conv.transcriptRaw || '';
      if (transcript && contact.displayName) {
        // simple case-insensitive matching
        const nameRegex = new RegExp(contact.displayName, 'i');
        if (nameRegex.test(transcript)) {
          score += 0.5;
          reasons.push('Name mentioned in transcript');
        } else {
          // split by space and see if first name or last name is mentioned
          const parts = contact.displayName.split(' ');
          let matchedParts = 0;
          for (const part of parts) {
            if (part.length > 2 && new RegExp(part, 'i').test(transcript)) {
              matchedParts++;
            }
          }
          if (matchedParts > 0) {
            score += 0.2 * matchedParts;
            reasons.push('Partial name match in transcript');
          }
        }
      }
      
      // 3. Same Event (if both are linked to the same event)
      if (conv.eventId && contact.eventId && conv.eventId === contact.eventId) {
        score += 0.3;
        reasons.push('From the same event');
      }
      
      if (score > 0.4) {
        suggestions.push({
          contactId: contact.id,
          conversationId: conv.id,
          confidence: Math.min(score, 1.0),
          reason: reasons.join(' and ')
        });
      }
    }
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

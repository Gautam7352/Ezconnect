import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { EntityChip } from './entity-chip';
import { ConversationWithEntities } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';

type TranscriptViewProps = {
  conversation: ConversationWithEntities;
};

export function TranscriptView({ conversation }: TranscriptViewProps) {
  const theme = useTheme();

  const transcript = conversation.transcriptEnhanced || conversation.transcriptCloud || conversation.transcriptRaw;

  return (
    <View style={styles.container} testID="transcript-view">
      {conversation.entities && conversation.entities.length > 0 && (
        <View style={styles.entitiesContainer}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Detected Entities
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {conversation.entities.map((entity) => (
              <EntityChip key={entity.id} entity={entity} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.transcriptBox, { backgroundColor: theme.card }]}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Transcript
        </ThemedText>
        {transcript ? (
          <ThemedText style={styles.transcriptText}>
            {transcript}
          </ThemedText>
        ) : (
          <ThemedText style={styles.emptyText}>
            Transcript is being generated or is unavailable.
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entitiesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    opacity: 0.8,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  transcriptBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  transcriptText: {
    lineHeight: 24,
  },
  emptyText: {
    opacity: 0.5,
    fontStyle: 'italic',
  },
});

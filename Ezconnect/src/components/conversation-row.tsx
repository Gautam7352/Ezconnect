import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ConversationRow as DBConversationRow } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

type ConversationRowProps = {
  conversation: DBConversationRow;
  onPress?: () => void;
};

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const theme = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recording': return 'radio-button-on';
      case 'processing': return 'sync';
      case 'done': return 'checkmark-circle';
      case 'failed': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return '#ef4444'; // red
      case 'processing': return '#3b82f6'; // blue
      case 'done': return '#22c55e'; // green
      case 'failed': return '#ef4444'; // red
      default: return theme.text;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dateStr = new Date(conversation.createdAt).toLocaleDateString();

  return (
    <Pressable 
      style={[styles.container, { backgroundColor: theme.card }]} 
      onPress={onPress}
      testID="conversation-row"
    >
      <View style={styles.headerRow}>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(conversation.status)} 
            size={16} 
            color={getStatusColor(conversation.status)} 
          />
          <ThemedText type="smallBold" style={[styles.statusText, { color: getStatusColor(conversation.status) }]}>
            {conversation.status.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="text" style={styles.metaText}>
          {dateStr} • {formatDuration(conversation.durationSeconds)}
        </ThemedText>
      </View>
      
      {conversation.summary ? (
        <ThemedText type="default" numberOfLines={2} style={styles.snippet}>
          {conversation.summary}
        </ThemedText>
      ) : conversation.transcriptRaw ? (
        <ThemedText type="default" numberOfLines={2} style={styles.snippet}>
          {conversation.transcriptRaw}
        </ThemedText>
      ) : (
        <ThemedText type="small" themeColor="text" style={styles.emptyText}>
          No transcript available yet.
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
  },
  metaText: {
    opacity: 0.6,
  },
  snippet: {
    marginTop: 4,
    opacity: 0.8,
  },
  emptyText: {
    marginTop: 4,
    opacity: 0.5,
    fontStyle: 'italic',
  },
});

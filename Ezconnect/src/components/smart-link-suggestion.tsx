import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { Contact, ConversationRow } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

type SmartLinkSuggestionProps = {
  contact: Contact;
  conversation: ConversationRow;
  confidence: number;
  onAccept: () => void;
  onReject: () => void;
};

export function SmartLinkSuggestion({ 
  contact, 
  conversation, 
  confidence, 
  onAccept, 
  onReject 
}: SmartLinkSuggestionProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.tint }]} testID="smart-link-suggestion">
      <View style={styles.header}>
        <Ionicons name="link" size={20} color={theme.tint} />
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Suggested Link
        </ThemedText>
      </View>
      
      <ThemedText type="small" style={styles.description}>
        We noticed you met {contact.displayName} around the time of this conversation. 
        Would you like to link them?
      </ThemedText>
      
      <View style={styles.confidenceRow}>
        <Ionicons name="flash" size={12} color="#f59e0b" />
        <ThemedText type="small" style={styles.confidenceText}>
          {Math.round(confidence * 100)}% match confidence
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Pressable 
          style={[styles.button, styles.rejectButton]} 
          onPress={onReject}
          testID="reject-button"
        >
          <ThemedText type="smallBold" style={styles.rejectText}>Dismiss</ThemedText>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.acceptButton, { backgroundColor: theme.tint }]} 
          onPress={onAccept}
          testID="accept-button"
        >
          <ThemedText type="smallBold" style={styles.acceptText}>Link Contact</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
  },
  description: {
    opacity: 0.8,
    marginBottom: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceText: {
    marginLeft: 4,
    opacity: 0.7,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  acceptButton: {
  },
  rejectText: {
    opacity: 0.8,
  },
  acceptText: {
    color: '#ffffff',
  },
});

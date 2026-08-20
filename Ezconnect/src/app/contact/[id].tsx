import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useContactStore } from '@/stores/use-contact-store';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loadContact, activeContact, loadConversations, conversations } = useContactStore();

  useEffect(() => {
    if (id) {
      loadContact(id);
      loadConversations(id);
    }
  }, [id, loadContact, loadConversations]);

  if (!activeContact) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const name = activeContact.displayName || 'Unknown Contact';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title">{name}</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Details</ThemedText>
          {activeContact.headline && <ThemedText>{activeContact.headline}</ThemedText>}
          {activeContact.company && <ThemedText>{activeContact.company}</ThemedText>}
          {activeContact.email && <ThemedText>{activeContact.email}</ThemedText>}
          {activeContact.phone && <ThemedText>{activeContact.phone}</ThemedText>}
          {activeContact.linkedinUrl && <ThemedText>LinkedIn: {activeContact.linkedinUrl}</ThemedText>}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Conversations</ThemedText>
          {conversations.length === 0 ? (
            <ThemedText style={styles.emptyText}>No conversations linked yet.</ThemedText>
          ) : (
            conversations.map((conv: any) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.conversationItem}
                onPress={() => router.push(`/conversation/${conv.id}` as any)}
              >
                <ThemedText type="defaultSemiBold">Date: {new Date(conv.date || conv.startedAt || Date.now()).toLocaleString()}</ThemedText>
                <ThemedText numberOfLines={2}>{conv.text || conv.transcript || 'No transcript available.'}</ThemedText>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.six, marginTop: Spacing.four },
  backBtn: { marginRight: Spacing.three },
  card: { padding: Spacing.four, borderRadius: 12, backgroundColor: '#f0f0f0', marginBottom: Spacing.six },
  section: { marginBottom: Spacing.six },
  sectionTitle: { marginBottom: Spacing.three },
  emptyText: { opacity: 0.6, fontStyle: 'italic' },
  conversationItem: { padding: Spacing.three, borderRadius: 8, backgroundColor: '#f9f9f9', marginBottom: Spacing.three, borderWidth: 1, borderColor: '#e0e0e0' }
});

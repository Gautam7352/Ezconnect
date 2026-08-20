import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { conversations } from '@/db/schema';

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConv() {
      if (!id) return;
      try {
        const res = await db.select().from(conversations).where(eq(conversations.id, id as string)).get();
        setConversation(res);
      } catch (err) {
        console.error('Failed to load conversation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConv();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!conversation) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Conversation not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title">Transcript</ThemedText>
        </View>

        <View style={styles.metaCard}>
          <ThemedText type="defaultSemiBold">Date: {new Date(conversation.startedAt || conversation.date || Date.now()).toLocaleString()}</ThemedText>
          <ThemedText>Status: {conversation.status || 'unknown'}</ThemedText>
          <ThemedText>Duration: {conversation.durationSeconds || 0}s</ThemedText>
        </View>

        <View style={styles.transcriptCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Full Transcript</ThemedText>
          <ThemedText>{conversation.transcript || conversation.text || 'No transcript available yet.'}</ThemedText>
        </View>

        <TouchableOpacity style={styles.linkBtn} onPress={() => {}}>
          <ThemedText style={styles.linkBtnText}>Manual Link Contact</ThemedText>
        </TouchableOpacity>

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
  metaCard: { padding: Spacing.four, borderRadius: 12, backgroundColor: '#f0f0f0', marginBottom: Spacing.four },
  transcriptCard: { padding: Spacing.four, borderRadius: 12, backgroundColor: '#f9f9f9', marginBottom: Spacing.six, borderWidth: 1, borderColor: '#e0e0e0' },
  sectionTitle: { marginBottom: Spacing.three },
  linkBtn: { backgroundColor: '#007AFF', padding: Spacing.four, borderRadius: 8, alignItems: 'center' },
  linkBtnText: { color: 'white', fontWeight: 'bold' }
});

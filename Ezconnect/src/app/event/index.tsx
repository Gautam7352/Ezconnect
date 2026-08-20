import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/db';
import { events } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { EventRow } from '@/types/domain';

export default function EventListScreen() {
  const router = useRouter();
  const [eventList, setEventList] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const rows = await db.select().from(events).orderBy(desc(events.eventDate));
        setEventList(rows);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">Events</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {eventList.length === 0 ? (
          <ThemedText style={styles.emptyText}>No events found. Events are automatically created when you meet people.</ThemedText>
        ) : (
          eventList.map(event => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => router.push(`/event/${event.id}` as any)}
            >
              <ThemedText type="subtitle">{event.name}</ThemedText>
              <ThemedText>{new Date(event.eventDate || Date.now()).toLocaleDateString()}</ThemedText>
              {event.venue && <ThemedText>📍 {event.venue}</ThemedText>}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.six, marginTop: Spacing.four, paddingHorizontal: Spacing.four },
  backBtn: { marginRight: Spacing.three },
  eventCard: { padding: Spacing.four, borderRadius: 12, backgroundColor: '#f0f0f0', marginBottom: Spacing.four },
  emptyText: { opacity: 0.6, fontStyle: 'italic', textAlign: 'center', marginTop: Spacing.six }
});

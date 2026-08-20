import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { events, contacts } from '@/db/schema';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEventData() {
      if (!id) return;
      try {
        const ev = await db.select().from(events).where(eq(events.id, id as string)).get();
        if (ev) {
          setEvent(ev);
          // Load contacts for this event
          const eventContacts = await db.select().from(contacts).where(eq(contacts.eventId, ev.id));
          setAttendees(eventContacts);
        }
      } catch (err) {
        console.error('Failed to load event data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!event) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Event not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">{event.name}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.metaCard}>
          <ThemedText type="defaultSemiBold">Date: {new Date(event.eventDate || Date.now()).toLocaleDateString()}</ThemedText>
          {event.venue && <ThemedText>Venue: {event.venue}</ThemedText>}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Attendees Met</ThemedText>
          {attendees.length === 0 ? (
            <ThemedText style={styles.emptyText}>No attendees linked to this event yet.</ThemedText>
          ) : (
            attendees.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactItem}
                onPress={() => router.push(`/contact/${contact.id}` as any)}
              >
                <ThemedText type="defaultSemiBold">{contact.displayName}</ThemedText>
                {contact.headline && <ThemedText numberOfLines={1}>{contact.headline}</ThemedText>}
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.six, marginTop: Spacing.four, paddingHorizontal: Spacing.four },
  backBtn: { marginRight: Spacing.three },
  metaCard: { padding: Spacing.four, borderRadius: 12, backgroundColor: '#f0f0f0', marginBottom: Spacing.six },
  section: { marginBottom: Spacing.six },
  sectionTitle: { marginBottom: Spacing.three },
  emptyText: { opacity: 0.6, fontStyle: 'italic' },
  contactItem: { padding: Spacing.three, borderRadius: 8, backgroundColor: '#f9f9f9', marginBottom: Spacing.three, borderWidth: 1, borderColor: '#e0e0e0' }
});

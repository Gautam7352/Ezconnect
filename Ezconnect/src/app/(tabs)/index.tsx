import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PersonaCard } from '@/components/persona-card';
import { usePersonaStore } from '@/stores/use-persona-store';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { activePersona } = usePersonaStore();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Home</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Active Persona</ThemedText>
        {activePersona ? (
          <PersonaCard persona={activePersona} onPress={() => router.push(`/persona/${activePersona.id}`)} />
        ) : (
          <View style={styles.emptyCard}>
            <ThemedText type="defaultSemiBold">No active profile</ThemedText>
            <ThemedText style={styles.emptyDesc}>Create your first persona to get started.</ThemedText>
            <ThemedText 
              style={styles.actionText} 
              onPress={() => router.push('/persona/new')}
            >
              Create Persona
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.actionsGrid}>
          <ThemedText 
            testID="quick-action-share" 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/share')}
          >
            Share Profile
          </ThemedText>
          <ThemedText 
            testID="quick-action-record" 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/record')}
          >
            Record Audio
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.six,
    marginTop: Spacing.four,
  },
  section: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  emptyDesc: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
    textAlign: 'center',
    opacity: 0.7,
  },
  actionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  quickAction: {
    flex: 1,
    padding: Spacing.four,
    backgroundColor: '#007AFF20',
    color: '#007AFF',
    textAlign: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: 'bold',
  }
});

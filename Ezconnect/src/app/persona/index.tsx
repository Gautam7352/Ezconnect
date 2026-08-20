import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PersonaCard } from '@/components/persona-card';
import { usePersonaStore } from '@/stores/use-persona-store';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function PersonaListScreen() {
  const router = useRouter();
  const { personas, isLoading, loadPersonas, setActivePersona } = usePersonaStore();

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  if (isLoading) {
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
        <ThemedText type="title">My Personas</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {personas.map(persona => (
          <View key={persona.id} style={styles.personaRow}>
            <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push(`/persona/${persona.id}`)}>
              <PersonaCard persona={persona as any} />
            </TouchableOpacity>
            
            {persona.isActive === 0 && (
              <TouchableOpacity style={styles.activeBtn} onPress={() => setActivePersona(persona.id)}>
                <ThemedText style={styles.activeBtnText}>Set Active</ThemedText>
              </TouchableOpacity>
            )}
            {persona.isActive === 1 && (
              <View style={styles.activeBadge}>
                <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/persona/new')}>
          <Ionicons name="add" size={24} color="white" />
          <ThemedText style={styles.createBtnText}>Create New Persona</ThemedText>
        </TouchableOpacity>
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
  personaRow: { marginBottom: Spacing.six },
  cardWrapper: { marginBottom: Spacing.two },
  activeBtn: { alignSelf: 'flex-start', padding: Spacing.two, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF' },
  activeBtnText: { color: '#007AFF', fontWeight: 'bold' },
  activeBadge: { alignSelf: 'flex-start', padding: Spacing.two, borderRadius: 8, backgroundColor: '#34C759' },
  activeBadgeText: { color: 'white', fontWeight: 'bold' },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', padding: Spacing.four, borderRadius: 8, marginTop: Spacing.four },
  createBtnText: { color: 'white', fontWeight: 'bold', marginLeft: Spacing.two }
});

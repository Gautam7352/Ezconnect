import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePersonaStore } from '@/stores/use-persona-store';
import { Spacing } from '@/constants/theme';

export default function PersonaEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { personas, createPersona, updatePersona } = usePersonaStore();

  const isNew = id === 'new';
  const existingPersona = personas.find(p => p.id === id);

  const [displayName, setDisplayName] = useState(existingPersona?.displayName || '');
  const [headline, setHeadline] = useState(existingPersona?.headline || '');
  const [company, setCompany] = useState(existingPersona?.company || '');

  const handleSave = async () => {
    if (!displayName.trim()) return;

    if (isNew) {
      await createPersona({
        displayName,
        headline,
        company,
        isActive: personas.length === 0 ? 1 : 0, // Make active if it's the first one
      } as any);
    } else if (id) {
      await updatePersona(id, {
        displayName,
        headline,
        company,
      });
    }

    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          {isNew ? 'Create Persona' : 'Edit Persona'}
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Full Name</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Headline (Optional)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Software Engineer"
            placeholderTextColor="#999"
            value={headline}
            onChangeText={setHeadline}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Company (Optional)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            placeholderTextColor="#999"
            value={company}
            onChangeText={setCompany}
          />
        </View>

        <ThemedText type="default" style={styles.saveButton} onPress={handleSave}>
          Save
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.four,
  },
  title: {
    marginBottom: Spacing.six,
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: Spacing.three,
    marginTop: Spacing.one,
    color: '#000', // Needs theme token handling ideally
  },
  saveButton: {
    backgroundColor: '#007AFF',
    color: '#fff',
    padding: Spacing.four,
    textAlign: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: Spacing.six,
  },
});

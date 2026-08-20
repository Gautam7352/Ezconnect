import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  
  // These would ideally be tied to MMKV or a Settings store
  const [apiKey, setApiKey] = useState('');
  const [autoDeleteAudio, setAutoDeleteAudio] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Cloud AI (BYOK)</ThemedText>
          <ThemedText style={styles.desc}>Enter your Gemini or Deepgram API key for enhanced cloud transcription.</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter API Key"
            placeholderTextColor="#999"
            secureTextEntry
            value={apiKey}
            onChangeText={setApiKey}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Storage Management</ThemedText>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: Spacing.four }}>
              <ThemedText type="defaultSemiBold">Auto-delete raw audio</ThemedText>
              <ThemedText style={styles.desc}>Delete raw audio files after successful transcription to save space.</ThemedText>
            </View>
            <Switch value={autoDeleteAudio} onValueChange={setAutoDeleteAudio} />
          </View>
        </View>

        <TouchableOpacity style={styles.dangerBtn}>
          <ThemedText style={styles.dangerBtnText}>Clear All Local Data</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.six, marginTop: Spacing.four, paddingHorizontal: Spacing.four },
  backBtn: { marginRight: Spacing.three },
  section: { marginBottom: Spacing.six },
  sectionTitle: { marginBottom: Spacing.two },
  desc: { opacity: 0.7, marginBottom: Spacing.four, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: Spacing.three,
    color: '#000',
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dangerBtn: {
    marginTop: Spacing.six,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center'
  },
  dangerBtnText: { color: '#FF3B30', fontWeight: 'bold' }
});

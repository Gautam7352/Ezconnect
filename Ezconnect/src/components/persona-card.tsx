import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { Persona } from '@/types/domain';

type PersonaCardProps = {
  persona: Persona;
  onPress?: (id: string) => void;
};

export function PersonaCard({ persona, onPress }: PersonaCardProps) {
  const subtitle = [persona.headline, persona.company].filter(Boolean).join(' @ ');

  return (
    <Pressable 
      testID="persona-card" 
      onPress={() => onPress?.(persona.id)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">{persona.displayName}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0', // To be replaced with theme token
  },
  pressed: {
    opacity: 0.7,
  },
  subtitle: {
    marginTop: Spacing.one,
    opacity: 0.8,
  },
});

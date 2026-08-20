import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { EventRow } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

type EventChipProps = {
  event: EventRow;
  onPress?: () => void;
};

export function EventChip({ event, onPress }: EventChipProps) {
  const theme = useTheme();

  let dateStr = '';
  if (event.eventDate) {
    dateStr = new Date(event.eventDate).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const content = (
    <View style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name="calendar-outline" size={12} color={theme.text} style={styles.icon} />
      <ThemedText type="small" style={styles.text} numberOfLines={1}>
        {event.name} {dateStr ? `• ${dateStr}` : ''}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} testID="event-chip">
        {content}
      </Pressable>
    );
  }

  return <View testID="event-chip">{content}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
    opacity: 0.7,
  },
  text: {
    fontSize: 12,
    opacity: 0.8,
  },
});

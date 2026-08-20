import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { EntityType, ConversationEntityRow } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

type EntityChipProps = {
  entity: ConversationEntityRow;
  onPress?: () => void;
};

export function EntityChip({ entity, onPress }: EntityChipProps) {
  const theme = useTheme();

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return 'person-outline';
      case 'topic': return 'pricetag-outline';
      case 'technology': return 'hardware-chip-outline';
      case 'action_item': return 'checkbox-outline';
      default: return 'bookmark-outline';
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'person': return '#3b82f6'; // blue
      case 'topic': return '#8b5cf6'; // purple
      case 'technology': return '#f59e0b'; // amber
      case 'action_item': return '#10b981'; // emerald
      default: return theme.text;
    }
  };

  const color = getEntityColor(entity.type);

  const content = (
    <View style={[styles.chip, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Ionicons name={getEntityIcon(entity.type)} size={12} color={color} style={styles.icon} />
      <ThemedText type="small" style={[styles.text, { color }]}>
        {entity.value}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} testID="entity-chip">
        {content}
      </Pressable>
    );
  }

  return <View testID="entity-chip">{content}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

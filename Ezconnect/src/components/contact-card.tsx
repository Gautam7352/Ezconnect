import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { Contact } from '@/types/domain';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

type ContactCardProps = {
  contact: Contact;
  onPress?: () => void;
};

export function ContactCard({ contact, onPress }: ContactCardProps) {
  const theme = useTheme();

  const getExchangeIcon = (method: string) => {
    switch (method) {
      case 'BLE': return 'bluetooth';
      case 'NFC': return 'card';
      case 'QR': return 'qr-code';
      default: return 'person-add';
    }
  };

  return (
    <Pressable 
      style={[styles.container, { backgroundColor: theme.card }]} 
      onPress={onPress}
      testID="contact-card"
    >
      <View style={styles.avatarContainer}>
        {contact.avatarUri ? (
          <Image source={{ uri: contact.avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.border }]}>
            <ThemedText type="subtitle" themeColor="text">
              {contact.displayName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {contact.displayName}
        </ThemedText>
        
        {contact.headline ? (
          <ThemedText type="small" themeColor="text" style={styles.secondaryText} numberOfLines={1}>
            {contact.headline}
          </ThemedText>
        ) : null}
        
        {contact.company ? (
          <ThemedText type="small" themeColor="text" style={styles.secondaryText} numberOfLines={1}>
            {contact.company}
          </ThemedText>
        ) : null}
      </View>
      
      <View style={styles.methodBadge}>
        <Ionicons name={getExchangeIcon(contact.exchangeMethod)} size={16} color={theme.text} />
        <ThemedText type="small" style={styles.methodText}>
          {contact.exchangeMethod}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  secondaryText: {
    opacity: 0.7,
    marginTop: 2,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  methodText: {
    marginLeft: 4,
    fontSize: 10,
    opacity: 0.8,
  },
});

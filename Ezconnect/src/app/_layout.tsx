import { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useDbMigrations } from '@/db';
import { usePersonaStore } from '@/stores/use-persona-store';
import { usePermissionsStore } from '@/stores/use-permissions-store';
import { createMMKV } from 'react-native-mmkv';
import { Text, View, StyleSheet } from 'react-native';

const storage = createMMKV();

export default function RootLayout() {
  const router = useRouter();
  const { success, error } = useDbMigrations();
  const [isReady, setIsReady] = useState(false);
  
  const loadPersonas = usePersonaStore((state) => state.loadPersonas);
  const checkPermissions = usePermissionsStore((state) => state.checkAll);

  useEffect(() => {
    if (success) {
      // Database is ready, load initial data
      const initApp = async () => {
        await loadPersonas();
        await checkPermissions();
        
        setIsReady(true);
        
        // Check onboarding
        const hasOnboarded = storage.getBoolean('onboarding_complete');
        if (!hasOnboarded) {
          router.replace('/onboarding');
        }
      };
      
      initApp();
    } else if (error) {
      console.error('Migration error:', error);
    }
  }, [success, error, router, loadPersonas, checkPermissions]);

  if (!isReady || error) {
    // Return a simple loading/error view until the splash screen logic is fully implemented
    return (
      <View style={styles.container}>
        <Text>{error ? 'Database Error' : 'Loading Ezconnect...'}</Text>
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

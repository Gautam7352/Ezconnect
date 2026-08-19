import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermissionsStore } from '@/stores/use-permissions-store';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const STEPS = [
  { id: 'welcome', title: 'Welcome to Ezconnect', description: 'Exchange contacts effortlessly even without internet.' },
  { id: 'mic', title: 'Microphone Access', description: 'Needed for offline AI transcriptions.', action: 'requestMicrophone' },
  { id: 'camera', title: 'Camera Access', description: 'Needed for QR code scanning.', action: 'requestCamera' },
  { id: 'bluetooth', title: 'Bluetooth Access', description: 'Needed for secure offline contact exchange.', action: 'requestBluetooth' },
  { id: 'done', title: "You're all set!", description: 'Enjoy frictionless networking.' },
];

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();
  const permissions = usePermissionsStore();

  const currentStep = STEPS[stepIndex];

  const handleNext = async () => {
    if (currentStep.action) {
      const action = permissions[currentStep.action as keyof typeof permissions] as () => Promise<boolean>;
      if (action) {
        await action();
      }
    }

    if (stepIndex === STEPS.length - 1) {
      storage.set('onboarding_complete', true);
      router.replace('/(tabs)');
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const getButtonText = () => {
    if (stepIndex === 0) return 'Get Started';
    if (stepIndex === STEPS.length - 1) return 'Enter App';
    return `Allow ${currentStep.title.replace(' Access', '')}`;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>{currentStep.title}</ThemedText>
        <ThemedText style={styles.description}>{currentStep.description}</ThemedText>
      </View>
      <View style={styles.footer}>
        <ThemedText type="default" style={styles.button} onPress={handleNext}>
          {getButtonText()}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  footer: {
    paddingBottom: Spacing.four,
  },
  button: {
    backgroundColor: '#007AFF', // Will replace with Theme token later
    color: '#fff',
    padding: Spacing.four,
    textAlign: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRecordingStore } from '@/stores/use-recording-store';
import { RecordingIndicator } from '@/components/recording-indicator';

export default function RecordScreen() {
  const { isRecording, startRecording, stopRecording, recordingDuration } = useRecordingStore();

  const handlePress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Conversation</Text>
      
      {isRecording && <RecordingIndicator isRecording={isRecording} duration={recordingDuration} />}

      <Pressable 
        testID="record-button"
        style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
        onPress={handlePress}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  recordButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RecordingIndicatorProps {
  isRecording: boolean;
  duration: number;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ isRecording, duration }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <>
          <View style={styles.redDot} />
          <Text style={styles.text}>Recording...</Text>
          <Text style={styles.duration}>{formatTime(duration)}</Text>
        </>
      ) : (
        <Text style={styles.text}>Ready to record</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  duration: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

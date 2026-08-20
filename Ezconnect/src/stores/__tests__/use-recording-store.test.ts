import { renderHook, act } from '@testing-library/react-native';
import { useRecordingStore } from '../use-recording-store';

jest.mock('expo-audio', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getURI: jest.fn(),
    })),
  },
}));

jest.mock('whisper.rn', () => ({
  initWhisper: jest.fn(),
}));

describe('useRecordingStore', () => {
  it('initializes with default state', async () => {
    const { result } = await renderHook(() => useRecordingStore());
    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingDuration).toBe(0);
    expect(result.current.transcription).toBe(null);
  });

  it('starts recording and updates state', async () => {
    const { result } = await renderHook(() => useRecordingStore());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.isRecording).toBe(true);
  });

  it('stops recording and updates state', async () => {
    const { result } = await renderHook(() => useRecordingStore());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.isRecording).toBe(true);
    
    await act(async () => {
      await result.current.stopRecording();
    });
    expect(result.current.isRecording).toBe(false);
  });
});

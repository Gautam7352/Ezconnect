import { create } from 'zustand';

interface RecordingState {
  isRecording: boolean;
  recordingDuration: number;
  transcription: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  recordingDuration: 0,
  transcription: null,
  startRecording: async () => {
    // Dummy implementation for tests
    set({ isRecording: true });
  },
  stopRecording: async () => {
    // Dummy implementation for tests
    set({ isRecording: false });
  },
}));

import { create } from 'zustand';
import { startAudioRecording, stopAudioRecording } from '@/services/audio-recorder';

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
    await startAudioRecording((text) => {
      set({ transcription: text });
    });
    set({ isRecording: true });
  },
  stopRecording: async () => {
    const { transcription } = await stopAudioRecording();
    set({ isRecording: false, transcription });
  },
}));

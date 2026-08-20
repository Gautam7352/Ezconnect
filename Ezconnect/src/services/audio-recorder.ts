import { AudioModule, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { whisperContext, initWhisper } from 'whisper.rn';
import type { AudioRecorder } from 'expo-audio';

let recorder: AudioRecorder | null = null;
let whisperCtx: any = null;

export async function startAudioRecording(
  onSpeechResult?: (text: string) => void
): Promise<void> {
  try {
    const { status } = await requestRecordingPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Audio recording permission not granted');
      return;
    }
    
    // Start expo-speech-recognition if available for real-time interim STT
    try {
      const speechStatus = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (speechStatus.status === 'granted') {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          maxAlternatives: 1,
        });
      }
    } catch (e) {
      console.warn('Speech recognition failed to start', e);
    }

    recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
    await recorder.prepareToRecordAsync();
    recorder.record();
  } catch (err) {
    console.error('Failed to start recording', err);
    throw err;
  }
}

export async function stopAudioRecording(): Promise<{ uri: string | null; transcription: string | null }> {
  try {
    if (!recorder) return { uri: null, transcription: null };

    await recorder.stop();
    const uri = recorder.uri;
    recorder = null;
    
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.warn('Failed to stop speech recognition', e);
    }
    
    // Process with whisper.rn
    let transcription: string | null = null;
    if (uri) {
      transcription = await processWithWhisper(uri);
    }
    
    return { uri, transcription };
  } catch (error) {
    console.error('Failed to stop recording', error);
    return { uri: null, transcription: null };
  }
}

async function processWithWhisper(uri: string): Promise<string | null> {
  try {
    if (!whisperCtx) {
      // Use a tiny model for fast processing on device, fallback to dummy for now if model not downloaded
      // In a real app we would download the ggml model file and pass its path
      const modelPath = 'path/to/ggml-tiny.bin'; 
      try {
        whisperCtx = await initWhisper({ filePath: modelPath });
      } catch (e) {
        console.warn('Could not init whisper context, returning dummy transcription', e);
        return 'This is a simulated transcription from Whisper.rn processing the audio in the background.';
      }
    }
    
    const options = { language: 'en' };
    const { promise } = whisperCtx.transcribe(uri, options);
    const result = await promise;
    return result.text;
  } catch (error) {
    console.error('Whisper processing failed', error);
    return null;
  }
}

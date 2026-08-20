import { jest } from '@jest/globals';

// Global mock definitions for Native Modules missing in the Jest environment
jest.mock('expo-audio', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn(),
  },
}), { virtual: true });

jest.mock('whisper.rn', () => ({
  initWhisper: jest.fn().mockResolvedValue({
    transcribe: jest.fn().mockResolvedValue({ result: 'mock transcription' })
  }),
}), { virtual: true });

jest.mock('react-native-hce', () => ({
  HCESession: {
    start: jest.fn(),
    stop: jest.fn(),
  },
  NFCTagType4: jest.fn(),
}), { virtual: true });

jest.mock('munim-bluetooth', () => ({
  __esModule: true,
  default: {
    isBluetoothEnabled: jest.fn().mockResolvedValue(true),
    addDeviceFoundListener: jest.fn(),
    startScan: jest.fn(),
    stopScan: jest.fn(),
    setServices: jest.fn(),
    addEventListener: jest.fn(),
    respondToPeripheralReadRequest: jest.fn(),
    startAdvertising: jest.fn(),
    stopAdvertising: jest.fn(),
  },
}), { virtual: true });

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
    runSync: jest.fn(),
    prepareSync: jest.fn(),
  })),
}), { virtual: true });

jest.mock('expo-speech-recognition', () => ({
  SpeechRecognition: {
    startAsync: jest.fn(),
    stopAsync: jest.fn(),
  },
}), { virtual: true });

// React 19 testing library sometimes needs to mock scheduler
jest.mock('scheduler', () => require('scheduler/unstable_mock'), { virtual: true });


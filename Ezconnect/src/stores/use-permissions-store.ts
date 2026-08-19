import { create } from 'zustand';
import { Linking, Platform } from 'react-native';

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked';

export type PermissionsState = {
  microphone: PermissionStatus;
  camera: PermissionStatus;
  bluetoothScan: PermissionStatus;
  bluetoothConnect: PermissionStatus;
  bluetoothAdvertise: PermissionStatus;
  nfc: PermissionStatus;
  nfcAvailable: boolean;
  bluetoothAvailable: boolean;

  // Actions
  checkAll: () => Promise<void>;
  requestMicrophone: () => Promise<void>;
  requestCamera: () => Promise<void>;
  requestBluetooth: () => Promise<void>;
  openSettings: () => void;
};

export const usePermissionsStore = create<PermissionsState>((set) => ({
  microphone: 'unknown',
  camera: 'unknown',
  bluetoothScan: 'unknown',
  bluetoothConnect: 'unknown',
  bluetoothAdvertise: 'unknown',
  nfc: 'unknown',
  nfcAvailable: false,
  bluetoothAvailable: false,

  checkAll: async () => {
    // Stub: To be implemented with expo-camera, expo-audio, etc.
    console.log('Checking permissions...');
  },

  requestMicrophone: async () => {
    // Stub: To be implemented
  },

  requestCamera: async () => {
    // Stub: To be implemented
  },

  requestBluetooth: async () => {
    // Stub: To be implemented
  },

  openSettings: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Linking.openSettings();
    }
  }
}));

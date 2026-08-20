import { create } from 'zustand';
import { startBleScanning, stopBleScanning, startBleAdvertising, stopBleAdvertising } from '@/services/ble-service';
import { startHce, stopHce } from '@/services/hce-service';

interface Device {
  id: string;
  name: string;
}

interface ShareState {
  isScanning: boolean;
  isAdvertising: boolean;
  discoveredDevices: Device[];
  nfcStatus: 'idle' | 'ready' | 'exchanging' | 'success' | 'error';
  
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  startAdvertising: (payload: string) => Promise<void>;
  stopAdvertising: () => void;
  startNfc: (vCard: string) => Promise<void>;
  stopNfc: () => void;
  reset: () => void;
}

export const useShareStore = create<ShareState>((set) => ({
  isScanning: false,
  isAdvertising: false,
  discoveredDevices: [],
  nfcStatus: 'idle',

  startScanning: async () => {
    set({ isScanning: true });
    await startBleScanning();
  },
  stopScanning: () => {
    stopBleScanning();
    set({ isScanning: false });
  },
  startAdvertising: async (payload: string) => {
    set({ isAdvertising: true });
    // Note: ensure setBlePayload is imported or passed to startBleAdvertising if needed
    // In our ble-service we have a setBlePayload function. We should import it.
    const { setBlePayload } = require('@/services/ble-service');
    setBlePayload(payload);
    await startBleAdvertising();
  },
  stopAdvertising: () => {
    stopBleAdvertising();
    set({ isAdvertising: false });
  },
  startNfc: async (vCard: string) => {
    set({ nfcStatus: 'ready' });
    await startHce(vCard);
  },
  stopNfc: () => {
    stopHce();
    set({ nfcStatus: 'idle' });
  },
  reset: () => {
    stopBleScanning();
    stopBleAdvertising();
    stopHce();
    set({
      isScanning: false,
      isAdvertising: false,
      discoveredDevices: [],
      nfcStatus: 'idle'
    });
  },
}));

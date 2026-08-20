import Bluetooth from 'munim-bluetooth';
import { useShareStore } from '@/stores/use-share-store';

const SERVICE_UUID = 'E2C00001-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = 'E2C00002-0000-1000-8000-00805F9B34FB';

let unsubscribeDeviceFound: (() => void) | null = null;
let unsubscribeCharacteristicRead: (() => void) | null = null;

let currentPayload: string = '';

export function setBlePayload(payload: string) {
  currentPayload = payload;
}

function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

export async function startBleScanning() {
  try {
    const isEnabled = await Bluetooth.isBluetoothEnabled();
    if (!isEnabled) {
      console.warn('Bluetooth is not enabled');
      return;
    }
    
    unsubscribeDeviceFound = Bluetooth.addDeviceFoundListener((device) => {
      if (device.rssi && device.rssi > -60) {
        useShareStore.setState((state) => {
          const exists = state.discoveredDevices.find((d) => d.id === device.id);
          if (exists) return state;
          
          return {
            discoveredDevices: [...state.discoveredDevices, { id: device.id, name: device.name || 'Unknown' }]
          };
        });
      }
    });

    await Bluetooth.startScan({ serviceUUIDs: [SERVICE_UUID] });
  } catch (error) {
    console.error('Failed to start BLE scanning', error);
  }
}

export function stopBleScanning() {
  Bluetooth.stopScan();
  if (unsubscribeDeviceFound) {
    unsubscribeDeviceFound();
    unsubscribeDeviceFound = null;
  }
}

export async function startBleAdvertising() {
  try {
    const isEnabled = await Bluetooth.isBluetoothEnabled();
    if (!isEnabled) {
      console.warn('Bluetooth is not enabled');
      return;
    }
    
    await Bluetooth.setServices([
      {
        uuid: SERVICE_UUID,
        characteristics: [
          {
            uuid: CHARACTERISTIC_UUID,
            properties: ['read', 'notify'],
            permissions: ['readable'] as any,
          }
        ]
      }
    ]);
    
    unsubscribeCharacteristicRead = Bluetooth.addEventListener('peripheralReadRequest', (request: any) => {
      if (request.characteristicUUID === CHARACTERISTIC_UUID) {
        const hexPayload = stringToHex(currentPayload);
        Bluetooth.respondToPeripheralReadRequest(request.requestId, hexPayload);
      }
    });

    await Bluetooth.startAdvertising({
      localName: 'Ezconnect User',
      serviceUUIDs: [SERVICE_UUID],
    });
  } catch (error) {
    console.error('Failed to start BLE advertising', error);
  }
}

export function stopBleAdvertising() {
  Bluetooth.stopAdvertising();
  if (unsubscribeCharacteristicRead) {
    unsubscribeCharacteristicRead();
    unsubscribeCharacteristicRead = null;
  }
}

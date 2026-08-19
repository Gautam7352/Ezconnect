import { usePermissionsStore } from '../use-permissions-store';
import { Platform } from 'react-native';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Linking: { openSettings: jest.fn() }
}));

describe('usePermissionsStore', () => {
  beforeEach(() => {
    usePermissionsStore.setState({
      microphone: 'unknown',
      camera: 'unknown',
      bluetoothScan: 'unknown',
      bluetoothConnect: 'unknown',
      bluetoothAdvertise: 'unknown',
      nfc: 'unknown',
      nfcAvailable: false,
      bluetoothAvailable: false
    });
  });

  it('should initialize with default states', () => {
    const state = usePermissionsStore.getState();
    expect(state.microphone).toBe('unknown');
    expect(state.nfcAvailable).toBe(false);
  });
});

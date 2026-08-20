import { renderHook, act } from '@testing-library/react-native';
import { useShareStore } from '../../stores/use-share-store';

describe('useShareStore', () => {
  beforeEach(async () => {
    const { result } = await renderHook(() => useShareStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should have initial state', async () => {
    const { result } = await renderHook(() => useShareStore());
    expect(result.current.isScanning).toBe(false);
    expect(result.current.isAdvertising).toBe(false);
    expect(result.current.discoveredDevices).toEqual([]);
    expect(result.current.nfcStatus).toBe('idle');
  });

  it('should start and stop scanning', async () => {
    const { result } = await renderHook(() => useShareStore());
    
    act(() => {
      result.current.startScanning();
    });
    expect(result.current.isScanning).toBe(true);

    act(() => {
      result.current.stopScanning();
    });
    expect(result.current.isScanning).toBe(false);
  });

  it('should start and stop advertising', async () => {
    const { result } = await renderHook(() => useShareStore());
    
    act(() => {
      result.current.startAdvertising('dummy-payload');
    });
    expect(result.current.isAdvertising).toBe(true);

    act(() => {
      result.current.stopAdvertising();
    });
    expect(result.current.isAdvertising).toBe(false);
  });
});

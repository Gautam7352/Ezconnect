import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ShareScreen from '../share';
import { useShareStore } from '../../../stores/use-share-store';

// Mock QrDisplay
jest.mock('../../../components/qr-display', () => ({
  QrDisplay: () => {
    const { View } = require('react-native');
    return <View testID="mock-qr-display" />;
  }
}));

describe('ShareScreen', () => {
  beforeEach(() => {
    useShareStore.setState({
      isScanning: false,
      isAdvertising: false,
      discoveredDevices: [],
    });
  });

  it('renders correctly', async () => {
    const { getByTestId, getByText } = await render(<ShareScreen />);
    expect(getByTestId('share-screen')).toBeTruthy();
    expect(getByTestId('mock-qr-display')).toBeTruthy();
    expect(getByText('Share Profile')).toBeTruthy();
    expect(getByText('Start Scanning')).toBeTruthy();
    expect(getByText('Start Advertising')).toBeTruthy();
  });

  it('toggles scanning state', async () => {
    const { getByTestId, getByText } = await render(<ShareScreen />);
    const scanButton = getByTestId('scan-button');
    
    fireEvent.press(scanButton);
    expect(useShareStore.getState().isScanning).toBe(true);
    expect(getByText('Stop Scanning')).toBeTruthy();

    fireEvent.press(scanButton);
    expect(useShareStore.getState().isScanning).toBe(false);
    expect(getByText('Start Scanning')).toBeTruthy();
  });

  it('toggles advertising state', async () => {
    const { getByTestId, getByText } = await render(<ShareScreen />);
    const advertiseButton = getByTestId('advertise-button');
    
    fireEvent.press(advertiseButton);
    expect(useShareStore.getState().isAdvertising).toBe(true);
    expect(getByText('Stop Advertising')).toBeTruthy();

    fireEvent.press(advertiseButton);
    expect(useShareStore.getState().isAdvertising).toBe(false);
    expect(getByText('Start Advertising')).toBeTruthy();
  });

  it('displays discovered devices', async () => {
    useShareStore.setState({
      discoveredDevices: [
        { id: '1', name: 'Device A' },
        { id: '2', name: 'Device B' },
      ],
    });

    const { getByText } = await render(<ShareScreen />);
    expect(getByText('Device A')).toBeTruthy();
    expect(getByText('Device B')).toBeTruthy();
  });
});

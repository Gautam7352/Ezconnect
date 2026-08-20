import React from 'react';
import { render } from '@testing-library/react-native';
import { QrDisplay } from '../../components/qr-display';

// Mock react-native-qrcode-svg since we only want to test our wrapper
jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return function MockQRCode(props: any) {
    return <View testID="mock-qrcode" {...props} />;
  };
});

describe('QrDisplay', () => {
  it('renders correctly with given value', async () => {
    const { getByTestId } = await render(<QrDisplay value="test-data" />);
    expect(getByTestId('qr-display')).toBeTruthy();
    const qrCode = getByTestId('mock-qrcode');
    expect(qrCode.props.value).toBe('test-data');
    expect(qrCode.props.size).toBe(200);
  });

  it('respects custom size', async () => {
    const { getByTestId } = await render(<QrDisplay value="test-data" size={300} />);
    const qrCode = getByTestId('mock-qrcode');
    expect(qrCode.props.size).toBe(300);
  });
});

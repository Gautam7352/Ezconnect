import React from 'react';
import { render } from '@testing-library/react-native';
import { BleDeviceCard } from '../../components/ble-device-card';

describe('BleDeviceCard', () => {
  it('renders correctly with device info', async () => {
    const { getByText, getByTestId } = await render(
      <BleDeviceCard id="12:34:56:78:90" name="My Phone" />
    );
    
    expect(getByTestId('ble-device-card')).toBeTruthy();
    expect(getByText('My Phone')).toBeTruthy();
    expect(getByText('12:34:56:78:90')).toBeTruthy();
  });
});

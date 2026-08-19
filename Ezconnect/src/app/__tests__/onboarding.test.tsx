import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import OnboardingScreen from '../onboarding';
import { useRouter } from 'expo-router';
import { usePermissionsStore } from '@/stores/use-permissions-store';
import { storage } from '@/db';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/db', () => ({
  storage: {
    set: jest.fn(),
  },
}));

jest.mock('@/stores/use-permissions-store', () => {
  let state = {
    requestMicrophone: jest.fn().mockResolvedValue(true),
    requestCamera: jest.fn().mockResolvedValue(true),
    requestBluetooth: jest.fn().mockResolvedValue(true),
  };
  return {
    usePermissionsStore: jest.fn(() => state),
  };
});

describe('OnboardingScreen', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  it('renders the welcome step initially', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Welcome to Ezconnect')).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('progresses through the steps and completes onboarding', async () => {
    const { getByText, queryByText } = render(<OnboardingScreen />);
    
    // Step 1: Welcome -> Mic
    fireEvent.press(getByText('Get Started'));
    expect(getByText('Microphone Access')).toBeTruthy();

    // Step 2: Mic -> Camera
    const store = usePermissionsStore();
    await act(async () => {
      fireEvent.press(getByText('Allow Microphone'));
    });
    expect(store.requestMicrophone).toHaveBeenCalled();
    expect(getByText('Camera Access')).toBeTruthy();

    // Step 3: Camera -> Bluetooth
    await act(async () => {
      fireEvent.press(getByText('Allow Camera'));
    });
    expect(store.requestCamera).toHaveBeenCalled();
    expect(getByText('Bluetooth Access')).toBeTruthy();

    // Step 4: Bluetooth -> Done
    await act(async () => {
      fireEvent.press(getByText('Allow Bluetooth'));
    });
    expect(store.requestBluetooth).toHaveBeenCalled();
    expect(getByText("You're all set!")).toBeTruthy();

    // Step 5: Finish
    await act(async () => {
      fireEvent.press(getByText('Enter App'));
    });

    expect(storage.set).toHaveBeenCalledWith('onboarding_complete', true);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});

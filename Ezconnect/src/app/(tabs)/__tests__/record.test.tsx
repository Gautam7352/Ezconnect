import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import RecordScreen from '../record';
import { useRecordingStore } from '@/stores/use-recording-store';

// Mock the store
jest.mock('@/stores/use-recording-store', () => ({
  useRecordingStore: jest.fn(),
}));

jest.mock('@/components/recording-indicator', () => ({
  RecordingIndicator: () => <></>,
}));

describe('RecordScreen', () => {
  const mockStartRecording = jest.fn();
  const mockStopRecording = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRecordingStore as unknown as jest.Mock).mockReturnValue({
      status: 'idle',
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });
  });

  it('renders correctly in idle state', () => {
    const { getByText } = render(<RecordScreen />);
    expect(getByText('Start Recording')).toBeTruthy();
  });

  it('calls startRecording when pressed in idle state', async () => {
    const { getByTestId } = render(<RecordScreen />);
    
    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });
    
    expect(mockStartRecording).toHaveBeenCalled();
  });

  it('calls stopRecording when pressed in recording state', async () => {
    (useRecordingStore as unknown as jest.Mock).mockReturnValue({
      status: 'recording',
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });

    const { getByTestId, getByText } = render(<RecordScreen />);
    
    expect(getByText('Stop Recording')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });
    
    expect(mockStopRecording).toHaveBeenCalled();
  });
});

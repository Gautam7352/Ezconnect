import React from 'react';
import { render } from '@testing-library/react-native';
import { RecordingIndicator } from '../recording-indicator';

describe('RecordingIndicator', () => {
  it('renders correctly when recording', async () => {
    const { getByText } = await render(<RecordingIndicator isRecording={true} duration={12} />);
    expect(getByText('Recording...')).toBeTruthy();
    expect(getByText('00:12')).toBeTruthy();
  });

  it('renders correctly when not recording', async () => {
    const { getByText } = await render(<RecordingIndicator isRecording={false} duration={0} />);
    expect(getByText('Ready to record')).toBeTruthy();
  });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../index';
import { usePersonaStore } from '@/stores/use-persona-store';

jest.mock('@/stores/use-persona-store', () => {
  return {
    usePersonaStore: jest.fn(),
  };
});

describe('HomeScreen', () => {
  it('renders the active persona and quick actions', async () => {
    (usePersonaStore as unknown as jest.Mock).mockReturnValue({
      activePersona: {
        id: 'p1',
        displayName: 'Gautam Kumar',
        headline: 'Android Engineer'
      },
    });

    const { getByText, getByTestId } = await render(<HomeScreen />);
    
    expect(getByText('Gautam Kumar')).toBeTruthy();
    expect(getByText('Android Engineer')).toBeTruthy();
    expect(getByTestId('quick-action-share')).toBeTruthy();
    expect(getByTestId('quick-action-record')).toBeTruthy();
  });

  it('renders an empty state when no active persona exists', async () => {
    (usePersonaStore as unknown as jest.Mock).mockReturnValue({
      activePersona: null,
    });

    const { getByText } = await render(<HomeScreen />);
    expect(getByText('No active profile')).toBeTruthy();
    expect(getByText('Create your first persona to get started.')).toBeTruthy();
  });
});

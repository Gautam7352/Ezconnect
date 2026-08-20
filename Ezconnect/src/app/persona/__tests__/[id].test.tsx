import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PersonaScreen from '../[id]';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePersonaStore } from '@/stores/use-persona-store';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/stores/use-persona-store', () => {
  const store = {
    personas: [
      { id: 'p1', displayName: 'Jane Doe', headline: 'Dev', company: 'Acme', isActive: 1 }
    ],
    createPersona: jest.fn().mockResolvedValue('new-id'),
    updatePersona: jest.fn().mockResolvedValue(true),
  };
  return {
    usePersonaStore: () => store,
  };
});

describe('PersonaEditorScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  });

  it('renders correctly for creating a new persona', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'new' });
    
    const { getByPlaceholderText, getByText } = await render(<PersonaScreen />);
    
    expect(getByText('Create Persona')).toBeTruthy();
    const nameInput = getByPlaceholderText('Full Name');
    
    fireEvent.changeText(nameInput, 'John Smith');
    fireEvent.press(getByText('Save'));

    const store = require('@/stores/use-persona-store').usePersonaStore();
    expect(store.createPersona).toHaveBeenCalledWith(expect.objectContaining({
      displayName: 'John Smith',
      isActive: 1, // First persona should be active
    }));
    
    // Using simple setTimeout to flush microtasks for the mock promise
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders correctly for editing an existing persona', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'p1' });
    
    const { getByDisplayValue, getByText } = await render(<PersonaScreen />);
    
    expect(getByText('Edit Persona')).toBeTruthy();
    expect(getByDisplayValue('Jane Doe')).toBeTruthy();
    expect(getByDisplayValue('Dev')).toBeTruthy();
    
    const headlineInput = getByDisplayValue('Dev');
    fireEvent.changeText(headlineInput, 'Senior Dev');
    
    fireEvent.press(getByText('Save'));

    const store = require('@/stores/use-persona-store').usePersonaStore();
    expect(store.updatePersona).toHaveBeenCalledWith('p1', expect.objectContaining({
      headline: 'Senior Dev'
    }));
  });
});

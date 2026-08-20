import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PersonaCard } from '../persona-card';
import { Persona } from '@/types/domain';

describe('PersonaCard', () => {
  const mockPersona: Persona = {
    id: 'p1',
    displayName: 'Jane Doe',
    headline: 'Senior Developer',
    company: 'Acme',
    isActive: 1,
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
    phone: null,
    email: null,
    linkedinUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    avatarUri: null,
    customLinks: null,
  };

  it('renders persona details correctly', async () => {
    const { getByText } = await render(<PersonaCard persona={mockPersona} />);
    expect(getByText('Jane Doe')).toBeTruthy();
    expect(getByText('Senior Developer @ Acme')).toBeTruthy();
  });

  it('triggers onPress when pressed', async () => {
    const onPressMock = jest.fn();
    const { getByTestId } = await render(<PersonaCard persona={mockPersona} onPress={onPressMock} />);
    
    fireEvent.press(getByTestId('persona-card'));
    expect(onPressMock).toHaveBeenCalledWith('p1');
  });
});

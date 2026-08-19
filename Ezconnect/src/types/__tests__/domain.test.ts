import { buildVCard, Persona } from '../domain';

describe('Domain Types - buildVCard', () => {
  it('should format a vCard correctly from a minimal Persona', () => {
    const persona: Persona = {
      id: '123',
      displayName: 'John Doe',
      headline: null,
      company: null,
      phone: null,
      email: null,
      linkedinUrl: null,
      githubUrl: null,
      portfolioUrl: null,
      avatarUri: null,
      customLinks: null,
      isActive: 1,
      sortOrder: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const vcard = buildVCard(persona);
    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('FN:John Doe');
    expect(vcard).toContain('END:VCARD');
    expect(vcard).not.toContain('ORG:');
  });

  it('should format a vCard correctly with all properties', () => {
    const persona: Persona = {
      id: '123',
      displayName: 'Jane Smith',
      headline: 'CTO',
      company: 'Acme Corp',
      phone: '+1234567890',
      email: 'jane@acme.com',
      linkedinUrl: 'https://linkedin.com/in/jane',
      githubUrl: 'https://github.com/jane',
      portfolioUrl: 'https://jane.com',
      avatarUri: null,
      customLinks: null,
      isActive: 1,
      sortOrder: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const vcard = buildVCard(persona);
    expect(vcard).toContain('FN:Jane Smith');
    expect(vcard).toContain('ORG:Acme Corp');
    expect(vcard).toContain('TITLE:CTO');
    expect(vcard).toContain('TEL;TYPE=CELL:+1234567890');
    expect(vcard).toContain('EMAIL;TYPE=WORK:jane@acme.com');
    expect(vcard).toContain('URL;TYPE=LinkedIn:https://linkedin.com/in/jane');
    expect(vcard).toContain('URL;TYPE=GitHub:https://github.com/jane');
    expect(vcard).toContain('URL;TYPE=Portfolio:https://jane.com');
  });
});

import { usePersonaStore } from '../use-persona-store';
import { db } from '@/db';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-123'
}));

// Mock the DB operations
jest.mock('@/db', () => {
  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockReturnThis(),
  };
  return { db: mockDb };
});

describe('usePersonaStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePersonaStore.setState({
      personas: [],
      activePersonaId: null,
      activePersona: null,
      isLoading: false
    });
  });

  it('should initialize with default state', () => {
    const state = usePersonaStore.getState();
    expect(state.personas).toEqual([]);
    expect(state.activePersonaId).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should load personas and set active persona', async () => {
    // Mock the DB returning one active persona
    (db.orderBy as jest.Mock).mockResolvedValueOnce([
      {
        id: 'p1',
        displayName: 'Test User',
        isActive: 1,
        customLinks: JSON.stringify([{ label: 'Web', url: 'https://test.com' }])
      }
    ]);

    await usePersonaStore.getState().loadPersonas();

    const state = usePersonaStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.personas).toHaveLength(1);
    expect(state.activePersonaId).toBe('p1');
    expect(state.activePersona?.displayName).toBe('Test User');
    expect(state.activePersona?.customLinks?.[0].url).toBe('https://test.com');
  });

  it('should create a new persona and reload', async () => {
    (db.orderBy as jest.Mock).mockResolvedValueOnce([]); // loadPersonas mock after insert

    const newPersona = {
      displayName: 'New Profile',
      isActive: 1
    } as any;

    const createdId = await usePersonaStore.getState().createPersona(newPersona);

    expect(createdId).toBe('test-uuid-123');
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-uuid-123',
      displayName: 'New Profile',
      isActive: 1
    }));
  });
});

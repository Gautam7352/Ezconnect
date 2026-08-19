import { create } from 'zustand';
import { Persona, PersonaInsert } from '@/types/domain';
import { db } from '@/db';
import { personas } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

export type PersonaState = {
  personas: Persona[];
  activePersonaId: string | null;
  activePersona: Persona | null;
  isLoading: boolean;

  // Actions
  loadPersonas: () => Promise<void>;
  setActivePersona: (id: string) => Promise<void>;
  createPersona: (data: PersonaInsert) => Promise<string>;
  updatePersona: (id: string, data: Partial<PersonaInsert>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
};

export const usePersonaStore = create<PersonaState>((set, get) => ({
  personas: [],
  activePersonaId: null,
  activePersona: null,
  isLoading: true,

  loadPersonas: async () => {
    set({ isLoading: true });
    try {
      const rows = await db.select().from(personas).orderBy(desc(personas.sortOrder));
      const parsedPersonas: Persona[] = rows.map(r => ({
        ...r,
        customLinks: r.customLinks ? JSON.parse(r.customLinks) : null
      }));
      const activeId = parsedPersonas.find(p => p.isActive === 1)?.id || null;
      
      set({ 
        personas: parsedPersonas, 
        activePersonaId: activeId,
        activePersona: activeId ? parsedPersonas.find(p => p.id === activeId) || null : null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load personas:', error);
      set({ isLoading: false });
    }
  },

  setActivePersona: async (id: string) => {
    try {
      // First, set all to inactive
      await db.update(personas).set({ isActive: 0, updatedAt: Date.now() });
      // Set the chosen one to active
      await db.update(personas).set({ isActive: 1, updatedAt: Date.now() }).where(eq(personas.id, id));
      
      // Reload from DB
      await get().loadPersonas();
    } catch (error) {
      console.error('Failed to set active persona:', error);
    }
  },

  createPersona: async (data: PersonaInsert) => {
    try {
      const newId = data.id || Crypto.randomUUID();
      const now = Date.now();
      
      // If no personas exist, make this one active by default
      const currentPersonas = get().personas;
      const isActive = currentPersonas.length === 0 ? 1 : (data.isActive ?? 0);

      const toInsert = {
        ...data,
        id: newId,
        isActive,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      };

      await db.insert(personas).values(toInsert);
      await get().loadPersonas();
      
      return newId;
    } catch (error) {
      console.error('Failed to create persona:', error);
      throw error;
    }
  },

  updatePersona: async (id: string, data: Partial<PersonaInsert>) => {
    try {
      await db.update(personas)
        .set({ ...data, updatedAt: Date.now() })
        .where(eq(personas.id, id));
      await get().loadPersonas();
    } catch (error) {
      console.error('Failed to update persona:', error);
      throw error;
    }
  },

  deletePersona: async (id: string) => {
    try {
      await db.delete(personas).where(eq(personas.id, id));
      await get().loadPersonas();
    } catch (error) {
      console.error('Failed to delete persona:', error);
      throw error;
    }
  }
}));

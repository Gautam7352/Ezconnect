import { Platform } from 'react-native';
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';

let dbInstance: any;

if (Platform.OS === 'web') {
  console.warn("Using mock DB on Web to prevent synchronous WASM deadlocks.");
  
  // Simple proxy to prevent crash when stores call db.select().from()...
  const createMockChain = (returnValue: any = []): any => {
    const chain = () => createMockChain(returnValue);
    return new Proxy(chain, {
      get: (target, prop) => {
        if (prop === 'then') return undefined; // Prevent infinite promise loops
        return createMockChain(returnValue);
      }
    });
  };
  
  dbInstance = {
    select: () => ({
      from: () => ({
        orderBy: () => Promise.resolve([]),
      })
    }),
    insert: () => ({
      values: () => Promise.resolve(),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      })
    }),
    delete: () => ({
      where: () => Promise.resolve(),
    })
  };
} else {
  // Open DB synchronously on Native
  const expoDb = openDatabaseSync('ezconnect.db', { enableChangeListener: true });

  // FTS5 Initialization SQL
  const fts5InitSql = `
  -- Contacts FTS5
  CREATE VIRTUAL TABLE IF NOT EXISTS contacts_fts USING fts5(
    display_name, headline, company, notes,
    content='contacts', tokenize='unicode61'
  );

  CREATE TRIGGER IF NOT EXISTS contacts_fts_ai AFTER INSERT ON contacts BEGIN
    INSERT INTO contacts_fts(rowid, display_name, headline, company, notes)
    VALUES (new.rowid, new.display_name, new.headline, new.company, new.notes);
  END;

  CREATE TRIGGER IF NOT EXISTS contacts_fts_au AFTER UPDATE ON contacts BEGIN
    DELETE FROM contacts_fts WHERE rowid = old.rowid;
    INSERT INTO contacts_fts(rowid, display_name, headline, company, notes)
    VALUES (new.rowid, new.display_name, new.headline, new.company, new.notes);
  END;

  CREATE TRIGGER IF NOT EXISTS contacts_fts_ad AFTER DELETE ON contacts BEGIN
    DELETE FROM contacts_fts WHERE rowid = old.rowid;
  END;
  `;

  expoDb.execSync(fts5InitSql);
  dbInstance = drizzle(expoDb, { schema });
}

export const db = dbInstance as ReturnType<typeof drizzle>;

export function useDbMigrations() {
  if (Platform.OS === 'web') return { success: true, error: null };
  return useMigrations(db, migrations);
}

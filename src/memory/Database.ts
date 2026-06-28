import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

/**
 * Database — Singleton para a conexão SQLite via @libsql/client
 * Usa arquivo local (file:./data/db.sqlite) — sem native bindings.
 *
 * Pattern: Singleton
 */
export class DatabaseInstance {
  private static instance: Client | null = null;

  private constructor() {}

  static getInstance(): Client {
    if (!DatabaseInstance.instance) {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = `file:${path.join(dataDir, 'db.sqlite')}`;
      DatabaseInstance.instance = createClient({ url: dbPath });
      console.log(`[Database] LibSQL inicializado em: ${dbPath}`);
    }
    return DatabaseInstance.instance;
  }

  /**
   * Inicializa as tabelas. Deve ser chamado uma vez no startup antes de qualquer operação.
   */
  static async initialize(): Promise<void> {
    const db = DatabaseInstance.getInstance();

    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL DEFAULT 'openai',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );
    `);

    console.log('[Database] Tabelas verificadas/criadas com sucesso.');
  }
}

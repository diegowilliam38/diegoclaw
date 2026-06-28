import { randomUUID } from 'crypto';
import { DatabaseInstance } from './Database';

export interface Conversation {
  id: string;
  user_id: string;
  provider: string;
  created_at: string;
}

/**
 * ConversationRepository — abstrai o acesso SQL para conversas.
 * Pattern: Repository (async com @libsql/client)
 */
export class ConversationRepository {
  /**
   * Busca conversa mais recente do usuário ou cria uma nova.
   */
  async findOrCreateByUserId(userId: string, provider: string): Promise<Conversation> {
    const db = DatabaseInstance.getInstance();

    const result = await db.execute({
      sql: 'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      args: [userId],
    });

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id as string,
        user_id: row.user_id as string,
        provider: row.provider as string,
        created_at: row.created_at as string,
      };
    }

    const newConversation: Conversation = {
      id: randomUUID(),
      user_id: userId,
      provider,
      created_at: new Date().toISOString(),
    };

    await db.execute({
      sql: 'INSERT INTO conversations (id, user_id, provider) VALUES (?, ?, ?)',
      args: [newConversation.id, newConversation.user_id, newConversation.provider],
    });

    return newConversation;
  }
}

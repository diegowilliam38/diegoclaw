import { DatabaseInstance } from './Database';
import { ChatMessage } from '../providers/IProvider';

/**
 * MessageRepository — abstrai o acesso SQL para mensagens.
 * Pattern: Repository (async com @libsql/client)
 */
export class MessageRepository {
  /**
   * Persiste uma mensagem na conversa.
   */
  async save(conversationId: string, role: ChatMessage['role'], content: string): Promise<void> {
    const db = DatabaseInstance.getInstance();
    await db.execute({
      sql: 'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      args: [conversationId, role, content],
    });
  }

  /**
   * Retorna as últimas N mensagens de uma conversa, ordenadas cronologicamente.
   */
  async findRecent(conversationId: string, limit: number): Promise<ChatMessage[]> {
    const db = DatabaseInstance.getInstance();

    const result = await db.execute({
      sql: `SELECT role, content FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at DESC
            LIMIT ?`,
      args: [conversationId, limit],
    });

    // Reverter para ordem cronológica (mais antigas primeiro)
    return result.rows
      .reverse()
      .map((row) => ({
        role: row.role as ChatMessage['role'],
        content: row.content as string,
      }));
  }
}

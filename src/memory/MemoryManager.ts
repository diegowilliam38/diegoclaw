import { ConversationRepository, Conversation } from './ConversationRepository';
import { MessageRepository } from './MessageRepository';
import { ChatMessage } from '../providers/IProvider';

/**
 * MemoryManager — Facade para o sistema de persistência (async).
 * Pattern: Facade
 */
export class MemoryManager {
  private conversationRepo = new ConversationRepository();
  private messageRepo = new MessageRepository();
  private windowSize: number;

  constructor() {
    this.windowSize = parseInt(process.env.MEMORY_WINDOW_SIZE ?? '20', 10);
  }

  async getOrCreateConversation(userId: string, provider = 'openai'): Promise<Conversation> {
    return this.conversationRepo.findOrCreateByUserId(userId, provider);
  }

  async saveMessage(
    conversationId: string,
    role: ChatMessage['role'],
    content: string
  ): Promise<void> {
    await this.messageRepo.save(conversationId, role, content);
  }

  async getContext(conversationId: string): Promise<ChatMessage[]> {
    return this.messageRepo.findRecent(conversationId, this.windowSize);
  }
}

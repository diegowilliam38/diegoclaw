// Interface base para todos os providers de LLM
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  name?: string;
  tool_calls?: any[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ProviderResponse {
  type: 'text' | 'tool_call';
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolCallId?: string;
}

export interface IProvider {
  /**
   * Envia mensagens ao LLM e retorna a resposta (text ou tool_call)
   */
  complete(
    messages: ChatMessage[],
    tools?: ToolDefinition[]
  ): Promise<ProviderResponse>;
}

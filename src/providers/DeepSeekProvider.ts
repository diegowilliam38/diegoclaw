import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import {
  IProvider,
  ChatMessage,
  ToolDefinition,
  ProviderResponse,
} from './IProvider';

/**
 * Converte nosso ChatMessage para o tipo discriminado exigido pelo OpenAI SDK.
 */
function toOpenAIMessage(m: ChatMessage): ChatCompletionMessageParam {
  switch (m.role) {
    case 'system':
      return { role: 'system', content: m.content || '' };
    case 'user':
      return { role: 'user', content: m.content || '' };
    case 'assistant':
      return { 
        role: 'assistant', 
        content: m.content || null,
        ...(m.tool_calls ? { tool_calls: m.tool_calls } : {})
      } as any;
    case 'tool':
      return {
        role: 'tool',
        content: m.content || '',
        tool_call_id: m.tool_call_id ?? 'unknown',
      };
  }
}

/**
 * DeepSeek Provider — Fallback quando OpenAI falhar.
 * API compatível com OpenAI SDK (mesmo endpoint format).
 */
export class DeepSeekProvider implements IProvider {
  private client: OpenAI;
  private model: string = 'deepseek-chat';

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY ?? 'placeholder',
      baseURL: 'https://api.deepseek.com/v1',
    });
    console.log('[DeepSeekProvider] Inicializado como fallback');
  }

  async complete(
    messages: ChatMessage[],
    tools?: ToolDefinition[]
  ): Promise<ProviderResponse> {
    const openaiMessages = messages.map(toOpenAIMessage);

    const openaiTools = tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      ...(openaiTools?.length ? { tools: openaiTools } : {}),
    });

    const choice = response.choices[0];

    if (choice.message.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0];
      return {
        type: 'tool_call',
        toolName: toolCall.function.name,
        toolArgs: JSON.parse(toolCall.function.arguments),
        toolCallId: toolCall.id,
      };
    }

    return {
      type: 'text',
      content: choice.message.content ?? '',
    };
  }
}

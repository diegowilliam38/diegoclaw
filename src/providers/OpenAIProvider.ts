import OpenAI from 'openai';
import { Langfuse } from 'langfuse';
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
 * Provider OpenAI — GPT-4o-mini (principal)
 * Suporte nativo a function calling para o ReAct loop.
 */
export class OpenAIProvider implements IProvider {
  private client: OpenAI;
  private model: string;
  private langfuse?: Langfuse;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    
    if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
      this.langfuse = new Langfuse();
      console.log(`[OpenAIProvider] Observabilidade Langfuse Habilitada (ADR-009).`);
    }
    
    console.log(`[OpenAIProvider] Inicializado com modelo: ${this.model}`);
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

    const generation = this.langfuse?.generation({
      name: 'AgentLoop_Complete',
      model: this.model,
      input: openaiMessages as any,
    });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      ...(openaiTools?.length ? { tools: openaiTools } : {}),
    });

    const choice = response.choices[0];

    generation?.end({
      output: choice.message as any,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      },
    });

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

import { IProvider, ChatMessage, ToolDefinition, ProviderResponse } from '../providers/IProvider';
import { ProviderFactory } from '../providers/ProviderFactory';
import { ToolRegistry } from '../tools/ToolRegistry';

export interface AgentLoopOptions {
  messages: ChatMessage[];
  systemPrompt: string;
  tools?: ToolDefinition[];
}

/**
 * AgentLoop — Motor de raciocínio ReAct do DiegoClaw.
 * Ciclo: Thought → Action (ToolCall) → Observation → ... → FinalAnswer
 *
 * Pattern: Template Method (dentro do loop), com limites determinísticos.
 */
export class AgentLoop {
  private provider: IProvider;
  private maxIterations: number;

  constructor(provider: IProvider) {
    this.provider = provider;
    this.maxIterations = parseInt(process.env.MAX_ITERATIONS ?? '5', 10);
  }

  async run(options: AgentLoopOptions): Promise<string> {
    const { systemPrompt, tools = ToolRegistry.getInstance().getDefinitions() } = options;
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...options.messages,
    ];

    console.log(`[AgentLoop] Iniciando ReAct | max_iterations=${this.maxIterations}`);

    let lastToolCallName = '';
    let lastToolCallArgs = '';
    let consecutiveLoops = 0;

    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      console.log(`\n[THOUGHT] Iteração ${iteration}/${this.maxIterations}`);

      let response: ProviderResponse;

      try {
        response = await this.provider.complete(messages, tools);
      } catch (err: any) {
        // Tenta fallback se o provider principal falhar
        console.error('[AgentLoop] Provider principal falhou com erro:', err.response?.data || err.message);
        console.warn('[AgentLoop] Tentando fallback para DeepSeek...');
        const fallback = ProviderFactory.createFallback();
        response = await fallback.complete(messages, tools);
      }

      // FinalAnswer — retorna ao usuário
      if (response.type === 'text') {
        console.log(`[FINAL] Resposta gerada na iteração ${iteration}`);
        return response.content ?? '';
      }

      // ToolCall — executa e reinjecta observação
      if (response.type === 'tool_call' && response.toolName) {
        
        // Loop Detector (ADR-009)
        const currentArgs = JSON.stringify(response.toolArgs);
        if (response.toolName === lastToolCallName && currentArgs === lastToolCallArgs) {
          consecutiveLoops++;
        } else {
          consecutiveLoops = 0;
        }

        lastToolCallName = response.toolName;
        lastToolCallArgs = currentArgs;

        if (consecutiveLoops >= 2) {
          console.warn(`[ADE] Loop detectado na tool: ${response.toolName}. Interrompendo execução!`);
          return `❌ Loop Detectado (ADR-009): Você tentou executar a ferramenta '${response.toolName}' com os mesmos argumentos repetidas vezes sem sucesso. Pare e analise o erro antes de prosseguir.`;
        }

        console.log(`[ACTION] Tool chamada: ${response.toolName}`);
        
        // Injeta a chamada de tool no histórico
        messages.push({
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              id: response.toolCallId || 'call_default',
              type: 'function',
              function: {
                name: response.toolName,
                arguments: JSON.stringify(response.toolArgs),
              },
            },
          ],
        });

        const tool = ToolRegistry.getInstance().getTool(response.toolName);
        let observation: string;

        if (tool) {
          observation = await tool.execute(response.toolArgs);
        } else {
          observation = `Erro: Ferramenta '${response.toolName}' não encontrada no registro.`;
        }

        console.log(`[OBSERVATION] ${observation.substring(0, 100)}...`);

        messages.push({
          role: 'tool',
          content: observation,
          tool_call_id: response.toolCallId || 'call_default',
          name: response.toolName,
        } as ChatMessage);
      }
    }

    // MAX_ITERATIONS atingido
    console.warn('[AgentLoop] MAX_ITERATIONS atingido sem resposta final.');
    return `Desculpe, não consegui completar a tarefa em ${this.maxIterations} iterações. Tente reformular o pedido.`;
  }
}

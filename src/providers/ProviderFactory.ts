import { IProvider } from './IProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { DeepSeekProvider } from './DeepSeekProvider';

/**
 * Factory para instanciar providers de LLM.
 * Centraliza a lógica de criação e suporte ao fallback.
 *
 * Pattern: Factory + Strategy
 */
export class ProviderFactory {
  /**
   * Cria o provider com base no nome.
   * Se o provider principal falhar, o AgentLoop solicita o fallback.
   */
  static create(providerName: string): IProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'deepseek':
        return new DeepSeekProvider();
      default:
        console.warn(
          `[ProviderFactory] Provider '${providerName}' não reconhecido. Usando OpenAI.`
        );
        return new OpenAIProvider();
    }
  }

  /**
   * Cria o provider de fallback para uso quando o primário falha.
   */
  static createFallback(): IProvider {
    const fallbackName = 'deepseek';
    console.warn(`[ProviderFactory] Ativando fallback: ${fallbackName}`);
    return ProviderFactory.create(fallbackName);
  }
}

import { IProvider } from '../providers/IProvider';
import { SkillMetadata } from './SkillLoader';

/**
 * Resultado do roteamento com suporte a cross-domain.
 */
export interface RouterResult {
  skillName: string | null;
  confidence: number;
  crossDomain: string[];
}

/**
 * SkillRouter — Usa LLM para identificar qual skill usar.
 *
 * V2: suporta cross-domain — quando uma pergunta cruza mais de um domínio,
 * retorna habilidades secundárias para enriquecer a resposta com múltiplas perspectivas.
 *
 * Exemplo: "Como fazer RAG em um Data Lakehouse?" →
 *   skillName: "ia-engineer", crossDomain: ["data-engineer"]
 */
export class SkillRouter {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  async route(
    userMessage: string,
    availableSkills: SkillMetadata[]
  ): Promise<RouterResult> {
    const emptyResult: RouterResult = { skillName: null, confidence: 1.0, crossDomain: [] };
    if (availableSkills.length === 0) return emptyResult;

    const skillList = availableSkills
      .map((s) => `- "${s.name}": ${s.description}`)
      .join('\n');

    const systemPrompt = `Você é um roteador especializado de um agente de IA chamado DiegoClaw.
Analise o input do usuário e identifique qual(is) skill(s) são mais adequadas.

Skills disponíveis:
${skillList}

Regras:
- Retorne SOMENTE um JSON válido, nada mais.
- "skillName": nome da skill PRINCIPAL (string) ou null se for conversa geral.
- "confidence": confiança na escolha (0.0 a 1.0).
- "crossDomain": array com nomes de skills SECUNDÁRIAS quando a pergunta claramente cruza múltiplos domínios.
  Use crossDomain APENAS quando a pergunta genuinamente requer perspectivas de 2+ áreas diferentes.
  Exemplos de cross-domain:
    - "Como fazer RAG em Data Lakehouse?" → ia-engineer + data-engineer
    - "Docker para deploy de agentes LLMs?" → devops + ia-engineer
  NÃO use crossDomain para perguntas com foco claro em apenas uma área.

Formato obrigatório:
{"skillName": "nome-ou-null", "confidence": 0.9, "crossDomain": []}`;

    try {
      const response = await this.provider.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);

      const content = response.content ?? '';
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) return emptyResult;

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        skillName: parsed.skillName ?? null,
        confidence: parsed.confidence ?? 0.8,
        crossDomain: Array.isArray(parsed.crossDomain) ? parsed.crossDomain : [],
      };
    } catch (err) {
      console.warn('[SkillRouter] Falha ao rotear. Usando modo geral.', err);
      return emptyResult;
    }
  }
}

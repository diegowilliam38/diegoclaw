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

    const systemPrompt = `Você é um roteador especializado do agente de IA DiegoClaw.
Analise a mensagem do usuário e identifique a skill PRINCIPAL e eventuais habilidades SECUNDÁRIAS (cross-domain).

Skills disponíveis:
${skillList}

Diretrizes de Roteamento de Domínio:
- "ia-engineer": Agentes, LangGraph, RAG, GraphRAG, Harness Engineering, Loop Engineering, MCP, Prompts, Spec-Driven Development, LLMs.
- "devops": Docker, Kubernetes, FastAPI, Node.js Patterns, CI/CD, Observabilidade, Infraestrutura.
- "data-engineer": Spark, Databricks, Delta Lake, SQL, dbt, ETL, Data Lakehouse, Modeling de Dados.
- "software-engineer": Clean Code, DDD, TDD, Arquitetura de Software, Refatoração, Design Patterns.
- "automations": MCP, n8n, Webhooks, automações de processos.
- "project-manager": PMBOK, gestão de projetos, prazos, entregáveis, Governança de IA.
- "diegoclaw-assistant": Governança de IA no Setor Público (CNJ 615, TSE, RIPD, LGPD), conversas gerais e perfil operacional.

Regras de Cross-Domain:
- Use "crossDomain" quando a pergunta genuinamente cruzar 2+ áreas técnicas.
  Exemplos:
    - "Harness Engineering e Loop Engineering em infra Docker/Kubernetes?" → ia-engineer + devops
    - "GraphRAG com Neo4j integrado a Data Lakehouse?" → ia-engineer + data-engineer
    - "Governança de IA e prevenção de prompt injection conforme CNJ/TSE?" → diegoclaw-assistant + ia-engineer

Formato de resposta (SOMENTE JSON):
{"skillName": "nome-da-skill-ou-null", "confidence": 0.95, "crossDomain": ["skill-secundaria"]}`;

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

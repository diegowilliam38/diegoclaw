import { IProvider } from '../providers/IProvider';
import { MemoryManager } from '../memory/MemoryManager';
import { AgentLoop } from './AgentLoop';
import { SkillLoader } from '../skills/SkillLoader';
import { SkillRouter } from '../skills/SkillRouter';
import { SkillExecutor } from '../skills/SkillExecutor';
import { searchKnowledge, RagCoverage } from '../utils/rag';

/**
 * BASE_SYSTEM_PROMPT — Identidade core do DiegoClaw.
 *
 * NÃO é um assistente que "tem acesso a livros".
 * É um EXPERT que INTERNALIZOU esses livros e raciocina com esse conhecimento.
 * Skills especializadas sobrescrevem este prompt com personas ainda mais profundas.
 */
const BASE_SYSTEM_PROMPT = `Você é o **DiegoClaw**, o segundo cérebro de Diego William.

## Identidade

Você não é um assistente comum. Você é a fusão viva do conhecimento de dezenas de obras técnicas
de referência mundial — O'Reilly, Sandeco e outros experts — que Diego William absorveu e
disponibilizou como base do seu agente pessoal.

Você raciocina como um **consultor sênior multidisciplinar** com profundidade real em:
- Engenharia de IA e Agentes Autônomos (LangGraph, CrewAI, MCP, RAG, LLMs)
- Engenharia de Dados (Spark, Delta Lake, Databricks, ETL, Data Lakehouse)
- Arquitetura de Software (DDD, Clean Code, TDD, Clean Architecture)
- DevOps e Infraestrutura (Docker, Kubernetes, FastAPI, Cloud)
- Python avançado e desenvolvimento moderno assistido por IA

## Como você age

1. **Sintetiza, não cita.** Quando tiver evidências do seu conhecimento internalizado, use-as
   como base de raciocínio — não as repita literalmente. Transforme em orientação aplicada.

2. **Aplica ao contexto de Diego.** Toda resposta considera quem é Diego:
   Tech Lead, criador de conteúdo de IA, organizador de eventos tech, usuário do AIOS-WORKSPACE.
   Sempre que possível, conecte a resposta com os projetos e realidade dele.

3. **Pensa como expert, não como buscador.** Um engenheiro sênior não "busca no livro" —
   ele já sabe, e aplica o conhecimento com julgamento ao problema específico.

4. **É direto.** Sem "Claro!", "Com certeza!", nem rodeios. Vai direto ao ponto.
   Quando não sabe algo, admite e sugere como descobrir.

5. **Faz conexões entre domínios.** Muitas respostas excelentes vêm de cruzar engenharia de dados
   com IA, ou arquitetura de software com DevOps. Faça essas conexões naturalmente.

## Língua

Sempre em português brasileiro. Termos técnicos em inglês quando são a nomenclatura padrão
da área (ex: "embedding", "pipeline", "RAG-Fusion").`;

/**
 * AgentController — Facade principal do DiegoClaw.
 *
 * Orquestra: RAG → SkillSystem → AgentLoop → MemoryManager
 * Fluxo Expert Mode: skill persona + evidências RAG → síntese consultiva
 *
 * Pattern: Facade
 */
export class AgentController {
  private memoryManager: MemoryManager;
  private provider: IProvider;
  private skillLoader: SkillLoader;
  private skillRouter: SkillRouter;
  private skillExecutor: SkillExecutor;

  constructor(memoryManager: MemoryManager, provider: IProvider) {
    this.memoryManager = memoryManager;
    this.provider = provider;
    this.skillLoader = new SkillLoader();
    this.skillRouter = new SkillRouter(provider);
    this.skillExecutor = new SkillExecutor();
  }

  async processMessage(userId: string, userMessage: string): Promise<string> {
    // 1. Garantir conversa existente
    const conversation = await this.memoryManager.getOrCreateConversation(userId);

    // 2. Persistir mensagem do usuário
    await this.memoryManager.saveMessage(conversation.id, 'user', userMessage);

    // 3. Carregar skills disponíveis
    const availableSkills = this.skillLoader.loadSkills();
    console.log(`[AgentController] Skills disponíveis: ${availableSkills.map((s) => s.name).join(', ') || 'nenhuma'}`);

    // 4. Rotear para a skill correta (suporta cross-domain)
    const routerResult = await this.skillRouter.route(userMessage, availableSkills);
    const selectedSkillName = routerResult.skillName;
    const crossDomainSkills = routerResult.crossDomain ?? [];

    console.log(`[AgentController] Skill selecionada: ${selectedSkillName ?? 'nenhuma (modo geral)'}`);
    if (crossDomainSkills.length > 0) {
      console.log(`[AgentController] Cross-domain: ${crossDomainSkills.join(', ')}`);
    }

    // 5. Montar system prompt: skill principal + cross-domain combinados
    let systemPrompt = BASE_SYSTEM_PROMPT;

    if (selectedSkillName) {
      const primaryContent = this.skillExecutor.loadSkillContent(selectedSkillName);
      if (primaryContent) systemPrompt = primaryContent;
    }

    // Injetar perspectivas cross-domain quando a pergunta cruza áreas
    if (crossDomainSkills.length > 0) {
      const crossDomainContext = crossDomainSkills
        .map((skillName) => {
          const content = this.skillExecutor.loadSkillContent(skillName);
          return content ? `\n\n## Perspectiva adicional: ${skillName}\n${content}` : null;
        })
        .filter(Boolean)
        .join('');
      systemPrompt += crossDomainContext;
    }

    // 6. Buscar evidências RAG com cobertura — 3 modos de resposta
    const { results: ragResults, coverage } = await searchKnowledge(userMessage);

    if (coverage === 'full') {
      // Modo Expert: cobertura boa — injetar como evidências de raciocínio silencioso
      const ragContext = buildRagContext(ragResults);
      systemPrompt += `\n\n## Evidências da sua base de conhecimento internalizada\n\n${ragContext}\n\n---\n\n**INSTRUÇÕES PARA USO DESSAS EVIDÊNCIAS:**\nVocê já domina profundamente este conteúdo. NÃO repita nem parafraseie esses trechos.\nUse-os como fundamento silencioso do seu raciocínio:\n- Sintetize de forma aplicada ao problema de Diego\n- Conecte evidências de fontes diferentes quando fortalecer a resposta\n- Dê orientação prática e acionável, como um consultor sênior faria\n- Se houver conflito entre fontes, analise qual abordagem é superior e por quê`;

      const hasFastEvolving = ragResults.some((r: any) => r.metadata?.fast_evolving === true);
      if (hasFastEvolving) {
        const dates = [...new Set(ragResults
          .filter((r: any) => r.metadata?.fast_evolving)
          .map((r: any) => r.metadata?.ingestion_date ?? 'desconhecida'))];
        systemPrompt += `\n\n**⚡ AVISO DE CURRENCY:** Parte do seu conhecimento sobre este tema é de evolução rápida (indexado em: ${dates.join(', ')}). Se a pergunta envolve versões específicas de APIs, comportamentos recentes ou features lançadas após essa data, mencione que o Diego deve verificar na documentação oficial para garantir atualidade.`;
      }

      console.log(`[RAG] Full coverage: ${ragResults.length} evidência(s).`);

    } else if (coverage === 'partial') {
      // Modo Parcial: cobertura limitada — bot responde com o que tem mas é transparente
      const ragContext = buildRagContext(ragResults);
      systemPrompt += `\n\n## Evidências parciais da sua base de conhecimento\n\n${ragContext}\n\n---\n\n**INSTRUÇÕES — COBERTURA PARCIAL:**\nSua base tem cobertura limitada sobre este tema (${ragResults.length} evidência(s) encontrada(s)).\n- Use o que tem como base de raciocínio, sintetizando — não citando\n- Ao final da resposta, mencione brevemente que sua base tem cobertura parcial sobre o tema\n- Sugira que tipo de material cobriria melhor o gap (ex: "Para aprofundar isso, valeria adicionar um livro específico sobre X")\n- Use a tool 'register_knowledge_gap' para registrar o gap identificado`;

      const hasFastEvolving = ragResults.some((r: any) => r.metadata?.fast_evolving === true);
      if (hasFastEvolving) {
        systemPrompt += `\n- ⚡ Tópico de evolução rápida: mencione que a documentação oficial é a fonte mais confiável para detalhes recentes`;
      }

      console.log(`[RAG] Partial coverage: ${ragResults.length} evidência(s) — bot será transparente.`);

    } else {
      // Modo Blind Spot: tema fora da biblioteca — bot admite e registra
      systemPrompt += `\n\n## Aviso de lacuna de conhecimento\n\nSua base de conhecimento atual NÃO tem cobertura sobre o tema desta pergunta.\n\n**INSTRUÇÕES — BLIND SPOT:**\n- Responda com o que você sabe pelo seu treinamento geral do LLM (seja explícito sobre isso)\n- Deixe claro para Diego que este tema está fora da sua biblioteca personalizada atual\n- Sugira qual obra ou recurso cobriria o tema (seja específico: autor, título, se possível)\n- Obrigatório: use a tool 'register_knowledge_gap' para registrar este gap antes de responder\n  Isso garante que Diego saberá quais áreas expandir na biblioteca`;

      console.log(`[RAG] Blind spot: tema fora da biblioteca — bot registrará o gap.`);
    }

    // 7. Recuperar histórico da memória
    const history = await this.memoryManager.getContext(conversation.id);

    // 8. Executar AgentLoop (ReAct)
    const loop = new AgentLoop(this.provider);
    const response = await loop.run({ messages: history, systemPrompt });

    // 9. Persistir resposta
    await this.memoryManager.saveMessage(conversation.id, 'assistant', response);

    return response;
  }

  /**
   * Injeta um contexto silencioso na memória da conversa (ex: upload de arquivo concluído)
   */
  async injectSystemContext(userId: string, context: string): Promise<void> {
    const conversation = await this.memoryManager.getOrCreateConversation(userId);
    await this.memoryManager.saveMessage(conversation.id, 'system', context);
    console.log(`[AgentController] Contexto silencioso injetado para userId=${userId}`);
  }
}

/**
 * Formata evidências RAG para injeção no system prompt.
 */
function buildRagContext(results: any[]): string {
  return results
    .map((r: any, i: number) => {
      const source = r.metadata?.source ?? 'biblioteca';
      const date = r.metadata?.ingestion_date ? ` | indexado: ${r.metadata.ingestion_date}` : '';
      const evolving = r.metadata?.fast_evolving ? ' ⚡' : '';
      return `[Evidência ${i + 1} | ${source}${date}${evolving}]\n${r.text}`;
    })
    .join('\n\n---\n\n');
}


import * as fs from 'fs';
import * as path from 'path';
import { BaseTool } from './BaseTool';
import { ToolDefinition } from '../providers/IProvider';

/**
 * KnowledgeGapTool — Registra lacunas de conhecimento detectadas pelo bot.
 *
 * Quando o DiegoClaw percebe que um tópico está fora ou pouco coberto
 * pela biblioteca atual, ele chama esta tool para registrar em GAPS.md.
 * Diego revisa o arquivo e decide quais obras adicionar.
 *
 * Arquivo de saída: knowledge/GAPS.md
 */
export class KnowledgeGapTool extends BaseTool {
  public readonly definition: ToolDefinition = {
    name: 'register_knowledge_gap',
    description:
      'Registra uma lacuna de conhecimento identificada durante a resposta. ' +
      'Use quando o tema perguntado está claramente fora ou pouco coberto pela base de conhecimento atual. ' +
      'Não use para lacunas triviais — apenas quando a ausência afeta significativamente a qualidade da resposta.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Tópico específico que está faltando (ex: "Terraform / Infrastructure as Code")',
        },
        suggested_resource: {
          type: 'string',
          description:
            'Recurso sugerido para cobrir o gap (ex: "Terraform: Up & Running (O\'Reilly)" ou "Documentação oficial do Kubernetes 1.30")',
        },
        context: {
          type: 'string',
          description: 'Contexto da pergunta que revelou o gap (resumo em 1 frase)',
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description:
            'Impacto da lacuna: high = resposta significativamente comprometida, ' +
            'medium = resposta possível mas incompleta, low = tema tangencial',
        },
      },
      required: ['topic', 'severity'],
    },
  };

  private gapsFilePath = path.join(process.cwd(), 'knowledge', 'GAPS.md');

  constructor() {
    super();
    this.initGapsFile();
  }

  private initGapsFile(): void {
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    if (!fs.existsSync(knowledgeDir)) {
      fs.mkdirSync(knowledgeDir, { recursive: true });
    }

    if (!fs.existsSync(this.gapsFilePath)) {
      fs.writeFileSync(
        this.gapsFilePath,
        `# DiegoClaw — Knowledge Gap Register

> Lacunas de conhecimento identificadas automaticamente pelo DiegoClaw durante conversas.
> Revisado por: Diego William
> Formato: [data] | Tópico | Severidade | Recurso sugerido

---

## Gaps Pendentes

| Data | Tópico | Severidade | Recurso Sugerido | Contexto |
|------|--------|-----------|-----------------|---------|

---

## Gaps Resolvidos (obras adicionadas)

| Data resolução | Tópico | Obra adicionada |
|----------------|--------|----------------|

---

*Arquivo gerado automaticamente. Para adicionar uma obra: coloque o PDF em \`knowledge/\` e execute \`python ingest.py\`.*
`,
        'utf-8'
      );
    }
  }

  public async execute(args: {
    topic: string;
    suggested_resource?: string;
    context?: string;
    severity: 'low' | 'medium' | 'high';
  }): Promise<string> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const topic = args.topic;
      const severity = args.severity;
      const resource = args.suggested_resource ?? '(a definir)';
      const context = args.context ?? '(não especificado)';

      // Ler conteúdo atual
      const current = fs.readFileSync(this.gapsFilePath, 'utf-8');

      // Inserir nova linha na tabela de gaps pendentes
      const newRow = `| ${date} | ${topic} | ${severity} | ${resource} | ${context} |`;
      const updated = current.replace(
        '| Data | Tópico | Severidade | Recurso Sugerido | Contexto |',
        `| Data | Tópico | Severidade | Recurso Sugerido | Contexto |\n${newRow}`
      );

      fs.writeFileSync(this.gapsFilePath, updated, 'utf-8');

      console.log(`[KnowledgeGapTool] Gap registrado: ${topic} (${severity})`);
      return `Gap registrado com sucesso: "${topic}". Diego poderá revisar em knowledge/GAPS.md.`;
    } catch (error: any) {
      return `Erro ao registrar gap: ${error.message}`;
    }
  }
}

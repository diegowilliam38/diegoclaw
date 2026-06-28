import { BaseTool } from "./BaseTool";

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, BaseTool> = new Map();

  private constructor() {}

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Registra uma nova ferramenta.
   */
  public register(tool: BaseTool): void {
    this.tools.set(tool.definition.name, tool);
    console.log(`[ToolRegistry] Ferramenta registrada: ${tool.definition.name}`);
  }

  /**
   * Retorna todas as definições de ferramentas formatadas para o provedor de LLM.
   */
  public getDefinitions() {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  /**
   * Retorna uma ferramenta pelo nome.
   */
  public getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }
}

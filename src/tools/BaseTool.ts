import { ToolDefinition } from "../providers/IProvider";

export abstract class BaseTool {
  public abstract readonly definition: ToolDefinition;

  /**
   * Executa a lógica da ferramenta.
   * @param args Argumentos passados pelo LLM.
   * @returns Resultado da execução como string (ou JSON stringified).
   */
  public abstract execute(args: any): Promise<string>;
}

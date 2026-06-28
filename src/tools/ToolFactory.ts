import { ToolRegistry } from "./ToolRegistry";
import { FileTool } from "./FileTool";
import { PdfTool } from "./PdfTool";
import { CodeInterpreterTool } from "./CodeInterpreterTool";
import { Context7Tool } from "./Context7Tool";
import { KnowledgeGapTool } from "./KnowledgeGapTool";
import { connectMcpServer } from "./McpIntegration";

export class ToolFactory {
  /**
   * Inicializa e registra todas as ferramentas disponíveis no sistema.
   */
  public static async initialize(): Promise<void> {
    const registry = ToolRegistry.getInstance();

    registry.register(new FileTool());
    registry.register(new PdfTool());
    registry.register(new CodeInterpreterTool());
    registry.register(new Context7Tool());
    registry.register(new KnowledgeGapTool());  // Mecanismo 3 — Gap Register

    // Conectar servidores MCP disponíveis (non-blocking, falhas não derrubam o bot)
    ToolFactory.connectMcpServers().catch((err) => {
      console.warn("[ToolFactory] Falha ao conectar servidores MCP (não crítico):", err.message);
    });

    console.log("[ToolFactory] Ferramentas core inicializadas.");
  }

  /**
   * Tenta conectar aos servidores MCP configurados no ambiente.
   * Cada servidor é opcional — falha individual não impede os outros.
   */
  private static async connectMcpServers(): Promise<void> {
    const mcpServers: Array<{ name: string; command: string; args: string[]; env?: Record<string, string> }> = [];

    // n8n MCP — ativo se N8N_MCP_ENABLED=true no .env
    if (process.env.N8N_MCP_ENABLED === "true") {
      mcpServers.push({
        name: "n8n",
        command: "npx",
        args: ["-y", "@n8n/mcp-server"],
        env: {
          N8N_API_URL: process.env.N8N_API_URL ?? "http://localhost:5678/api/v1",
          N8N_API_KEY: process.env.N8N_API_KEY ?? "",
          MCP_MODE: "stdio"
        }
      });
    }

    // Notion MCP — ativo se NOTION_API_KEY estiver configurado
    if (process.env.NOTION_API_KEY) {
      mcpServers.push({
        name: "notion",
        command: "npx",
        args: ["-y", "@notionhq/notion-mcp-server"],
        env: {
          OPENAPI_MCP_HEADERS: JSON.stringify({
            Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28"
          })
        }
      });
    }

    for (const server of mcpServers) {
      try {
        await connectMcpServer(server.name, server.command, server.args, server.env);
        console.log(`[ToolFactory] MCP '${server.name}' conectado com sucesso.`);
      } catch (err: any) {
        console.warn(`[ToolFactory] MCP '${server.name}' falhou ao conectar: ${err.message}`);
      }
    }
  }
}

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { BaseTool } from "./BaseTool";
import { ToolDefinition } from "../providers/IProvider";
import { ToolRegistry } from "./ToolRegistry";

/**
 * Tool dinâmico gerado a partir de uma ferramenta reportada via MCP.
 */
class McpDynamicTool extends BaseTool {
  public readonly definition: ToolDefinition;
  private client: Client;
  private mcpToolName: string;

  constructor(client: Client, mcpToolName: string, description: string, inputSchema: any) {
    super();
    this.client = client;
    this.mcpToolName = mcpToolName;
    
    // Normaliza inputSchema para o formato suportado pela OpenAI:
    // Se não houver propertes, usar string/object vazio
    this.definition = {
      name: "mcp_" + mcpToolName.replace(/-/g, "_"),
      description: description || `Tool ${mcpToolName} do MCP`,
      parameters: {
        type: "object",
        properties: inputSchema?.properties || {},
        required: inputSchema?.required || []
      }
    };
  }

  public async execute(args: any): Promise<string> {
    try {
      console.log(`[McpDynamicTool] Executing MCP Tool ${this.mcpToolName} with args:`, args);
      
      const timeoutMs = 10000;
      
      // Cria Promise com timeout de segurança
      const resultPromise = this.client.callTool({
        name: this.mcpToolName,
        arguments: args
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout de 10s excedido ao se comunicar com o servidor MCP")), timeoutMs)
      );

      const result = await Promise.race([resultPromise, timeoutPromise]) as any;

      if (result.isError) {
        return `Erro MCP: ${JSON.stringify(result.content)}`;
      }

      return JSON.stringify(result.content);
    } catch (e: any) {
       console.error(`[McpDynamicTool] Error executing ${this.mcpToolName}:`, e.message);
       return `Erro: falha ao executar a ferramenta MCP. ${e.message}`;
    }
  }
}

/**
 * Instancia e conecta um cliente MCP via STDIO, mapeando suas ferramentas para o ToolRegistry.
 */
export async function connectMcpServer(
  serverName: string,
  command: string,
  args: string[],
  env?: Record<string, string>
) {
  console.log(`[MCP] Iniciando conexão com servidor MCP: ${serverName}...`);

  const mergedEnv = env
    ? Object.fromEntries(
        Object.entries({ ...process.env, ...env }).filter(
          ([, v]) => v !== undefined
        )
      ) as Record<string, string>
    : undefined;

  const transport = new StdioClientTransport({
    command,
    args,
    ...(mergedEnv ? { env: mergedEnv } : {})
  });

  const client = new Client({
    name: "diegoclaw-mcp-client",
    version: "1.0.0"
  }, {
    capabilities: {
      sampling: {}
    }
  });

  try {
    await client.connect(transport);
    console.log(`[MCP] Conectado ao servidor ${serverName}. Carregando tools...`);
    
    const toolsResult = await client.listTools();
    const tools = toolsResult.tools;
    
    console.log(`[MCP] Servidor ${serverName} reportou ${tools.length} tool(s).`);
    
    const registry = ToolRegistry.getInstance();
    
    for (const tool of tools) {
       const dynamicTool = new McpDynamicTool(client, tool.name, tool.description || "", tool.inputSchema);
       registry.register(dynamicTool);
    }
    
    return client;
  } catch (error: any) {
    console.error(`[MCP] Erro fatal conectando ao servidor ${serverName}:`, error.message);
    throw error;
  }
}

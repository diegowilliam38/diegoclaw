import { BaseTool } from "./BaseTool";
import { ToolDefinition } from "../providers/IProvider";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class Context7Tool extends BaseTool {
  public readonly definition: ToolDefinition = {
    name: "context7_search",
    description: "Busca documentação atualizada de frameworks e bibliotecas (React, Next.js, Prisma, etc). Use sempre que precisar responder com precisão sobre versões ou APIs recentes.",
    parameters: {
      type: "object",
      properties: {
        library: {
          type: "string",
          description: "O nome da biblioteca ou framework (ex: 'react', 'nextjs', 'prisma').",
        },
        query: {
          type: "string",
          description: "O tema ou dúvida específica a pesquisar na documentação.",
        },
      },
      required: ["library", "query"],
    },
  };

  public async execute(args: { library: string; query: string }): Promise<string> {
    try {
      console.log(`[Context7Tool] Fetching docs for ${args.library} - Query: "${args.query}"`);
      
      const timeoutMs = 10000; // 10s teto
      
      const executePromise = execAsync(`npx -y ctx7 library ${args.library} "${args.query}"`, {
        timeout: timeoutMs
      });
      
      const { stdout, stderr } = await executePromise;

      if (stderr && !stderr.includes("Downloading") && stderr.trim() !== '') {
         console.warn(`[Context7Tool] Warning/Error from CLI: ${stderr}`);
      }

      const cleanOutput = stdout.trim();
      
      if (!cleanOutput) {
        return `Nenhum resultado encontrado na documentação para: ${args.query} em ${args.library}.`;
      }

      return cleanOutput;
    } catch (error: any) {
      console.error("[Context7Tool] Error:", error.message);
      if (error.killed && error.signal === 'SIGTERM') {
         return `Erro: A busca via Context7Tool demorou muito e foi cancelada (Timeout de 10s).`;
      }
      return `Erro ao buscar documentação no Context7Tool: ${error.message}`;
    }
  }
}

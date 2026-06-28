import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./BaseTool";
import { ToolDefinition } from "../providers/IProvider";

export class FileTool extends BaseTool {
  public readonly definition: ToolDefinition = {
    name: "file_system",
    description: "Permite listar e ler arquivos da pasta 'knowledge' do projeto.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list", "read"],
          description: "Ação a ser executada: list (listar arquivos) ou read (ler conteúdo)."
        },
        fileName: {
          type: "string",
          description: "Nome do arquivo a ser lido (apenas para ação 'read')."
        }
      },
      required: ["action"]
    }
  };

  private knowledgePath = path.join(process.cwd(), "knowledge");

  constructor() {
    super();
    // Garante que a pasta knowledge existe
    if (!fs.existsSync(this.knowledgePath)) {
      fs.mkdirSync(this.knowledgePath, { recursive: true });
    }
  }

  public async execute(args: { action: "list" | "read"; fileName?: string }): Promise<string> {
    try {
      if (args.action === "list") {
        const files = fs.readdirSync(this.knowledgePath);
        if (files.length === 0) return "A pasta 'knowledge' está vazia.";
        return `Arquivos disponíveis em knowledge:\n- ${files.join("\n- ")}`;
      }

      if (args.action === "read") {
        if (!args.fileName) return "Erro: fileName é obrigatório para a ação 'read'.";
        
        const filePath = path.join(this.knowledgePath, args.fileName);
        
        // Segurança: Impede path traversal
        if (!filePath.startsWith(this.knowledgePath)) {
          return "Erro: Acesso negado. Você só pode ler arquivos dentro da pasta 'knowledge'.";
        }

        if (!fs.existsSync(filePath)) {
          return `Erro: Arquivo '${args.fileName}' não encontrado.`;
        }

        const stats = fs.statSync(filePath);
        if (stats.size > 1024 * 500) { // 500KB limit para evitar estouro de contexto
           return "Erro: Arquivo muito grande. O limite individual é 500KB.";
        }

        const content = fs.readFileSync(filePath, "utf-8");
        return content;
      }

      return "Ação inválida.";
    } catch (error: any) {
      return `Erro ao acessar o sistema de arquivos: ${error.message}`;
    }
  }
}

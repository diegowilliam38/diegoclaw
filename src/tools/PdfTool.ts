import * as fs from "fs";
import * as path from "path";
import pdf from "pdf-parse";
import { BaseTool } from "./BaseTool";
import { ToolDefinition } from "../providers/IProvider";

export class PdfTool extends BaseTool {
  public readonly definition: ToolDefinition = {
    name: "pdf_reader",
    description: "Extrai texto de arquivos PDF na pasta 'knowledge'.",
    parameters: {
      type: "object",
      properties: {
        fileName: {
          type: "string",
          description: "Nome do arquivo PDF (ex: 'ebook.pdf')."
        }
      },
      required: ["fileName"]
    }
  };

  private knowledgePath = path.join(process.cwd(), "knowledge");

  public async execute(args: { fileName: string }): Promise<string> {
    try {
      const filePath = path.join(this.knowledgePath, args.fileName);

      if (!fs.existsSync(filePath)) {
        return `Erro: PDF '${args.fileName}' não encontrado em 'knowledge/'.`;
      }

      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);

      // Trunca o texto se for muito longo para o contexto (ex: 15.000 caracteres)
      const maxChars = 15000;
      let text = data.text;
      
      if (text.length > maxChars) {
        text = text.substring(0, maxChars) + "\n\n[...Texto truncado por ser muito longo...]";
      }

      return `Conteúdo extraído do PDF (${data.numpages} páginas):\n\n${text}`;
    } catch (error: any) {
      return `Erro ao ler PDF: ${error.message}`;
    }
  }
}

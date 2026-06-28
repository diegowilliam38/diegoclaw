import { BaseTool } from "./BaseTool";
import { ToolDefinition } from "../providers/IProvider";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import os from "os";

export class CodeInterpreterTool extends BaseTool {
  public readonly definition: ToolDefinition = {
    name: "code_interpreter",
    description: "Executa scripts Python ou Node.js (JavaScript) localmente em uma sandbox simples e retorna o output original do terminal. Ideal para testar código ou rodar algoritmos retirados de livros do acervo.",
    parameters: {
      type: "object",
      properties: {
        language: {
          type: "string",
          description: "A linguagem de programação. Apenas 'python' ou 'node'.",
          enum: ["python", "node"]
        },
        code: {
          type: "string",
          description: "O código-fonte executável."
        }
      },
      required: ["language", "code"]
    }
  };

  public async execute(args: { language: string, code: string }): Promise<string> {
    const { language, code } = args;
    
    if (language !== "python" && language !== "node") {
      return "Erro: Linguagem não suportada. Use 'python' ou 'node'.";
    }

    // Usar uma pasta temporária robusta do os
    const tmpDir = path.join(os.tmpdir(), "diegoclaw_scratch");
    await fs.mkdir(tmpDir, { recursive: true });

    const ext = language === "python" ? ".py" : ".js";
    const filename = `script_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(tmpDir, filename);

    try {
      await fs.writeFile(filePath, code, "utf-8");
      
      const cmd = language === "python" ? `python "${filePath}"` : `node "${filePath}"`;

      return new Promise((resolve) => {
        // Timeout fixo de 10 segundos
        exec(cmd, { timeout: 10000 }, async (error, stdout, stderr) => {
          // Limpeza assíncrona garantida
          await fs.unlink(filePath).catch(() => {});
          
          if (error) {
             if (error.killed) {
                return resolve(`Erro: Timeout de execução atingido. O script excedeu os 10 segundos.\nOutput até o timeout:\n${stdout}\n${stderr}`);
             }
             return resolve(`Erro na execução do código:\n[STDOUT]:\n${stdout}\n[STDERR]:\n${stderr}`);
          }
          
          let out = stdout.trim();
          resolve(out.length > 0 ? out : "(Processo concluído sem enviar saída para o console)");
        });
      });
    } catch (e: any) {
      return `Erro interno ao criar ou rodar o script no CodeInterpreter: ${e.message}`;
    }
  }
}

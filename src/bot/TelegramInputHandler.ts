import { Bot, Context, InputFile } from 'grammy';
import { AgentController } from '../core/AgentController';
import { AudioTranscriber } from '../utils/AudioTranscriber';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { VoiceSynthesizer } from '../utils/VoiceSynthesizer';

const INJECTION_PATTERNS = [
  'ignore suas instruções',
  'ignore previous instructions',
  'você agora é',
  'new persona',
  'system prompt',
  'ignore all previous',
  'esqueça tudo',
  'forget everything',
];

/**
 * TelegramInputHandler — Primeira camada de segurança e normalização.
 * Valida whitelist, sanitiza prompt injection, aciona AgentController.
 *
 * Pattern: Handler / Middleware
 */
export class TelegramInputHandler {
  private bot: Bot;
  private agentController: AgentController;
  private allowedUserIds: Set<string>;
  private audioTranscriber: AudioTranscriber;
  private voiceSynthesizer: VoiceSynthesizer;

  constructor(bot: Bot, agentController: AgentController) {
    this.bot = bot;
    this.agentController = agentController;

    const ids = (process.env.TELEGRAM_ALLOWED_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    this.allowedUserIds = new Set(ids);
    this.audioTranscriber = new AudioTranscriber();
    this.voiceSynthesizer = new VoiceSynthesizer();

    console.log(`[TelegramInputHandler] Whitelist: ${ids.length} usuário(s) autorizado(s)`);
  }

  /**
   * Registra os handlers no bot Grammy.
   */
  register(): void {
    this.bot.on('message:text', (ctx) => this.handleTextMessage(ctx));
    this.bot.on('message:voice', (ctx) => this.handleVoiceMessage(ctx));
    this.bot.on('message:document', (ctx) => this.handleDocument(ctx));

    this.bot.catch((err) => {
      console.error('[TelegramInputHandler] Erro não tratado:', err.message);
    });
  }

  private async handleTextMessage(ctx: Context): Promise<void> {
    const userId = String(ctx.from?.id ?? '');
    const chatId = ctx.chat?.id;
    const text = ctx.message?.text ?? '';

    // 1. Validar whitelist — silencioso se não autorizado
    if (!this.allowedUserIds.has(userId)) {
      console.warn(`[SECURITY] Mensagem ignorada de userId não autorizado: ${userId}`);
      return;
    }

    // 2. Sanitizar prompt injection
    const sanitized = this.sanitize(text);
    if (!sanitized) {
      await ctx.reply('❌ Mensagem bloqueada por segurança.');
      return;
    }

    // 3. Sinalizar que está processando (typing action)
    await ctx.replyWithChatAction('typing');

    // 4. Processar via AgentController
    try {
      console.log(`[INPUT] userId=${userId} | msg="${sanitized.substring(0, 80)}..."`);
      const response = await this.agentController.processMessage(userId, sanitized);
      await this.sendResponse(ctx, response);
    } catch (err: any) {
      console.error('[TelegramInputHandler] Erro ao processar mensagem:', err.message);
      await ctx.reply('❌ Ocorreu um erro interno. Tente novamente.');
    }
  }

  private async handleVoiceMessage(ctx: Context): Promise<void> {
    const userId = String(ctx.from?.id ?? '');
    
    if (!this.allowedUserIds.has(userId)) {
      console.warn(`[SECURITY] Áudio ignorado de userId não autorizado: ${userId}`);
      return;
    }

    try {
      await ctx.replyWithChatAction('typing');
      const file = await ctx.getFile();
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      
      const text = await this.audioTranscriber.transcribeVoice(fileUrl);
      console.log(`[INPUT VOICE] userId=${userId} | Transcrito: "${text.substring(0, 80)}..."`);
      
      // Valida injeção no texto transcrito
      const sanitized = this.sanitize(text);
      if (!sanitized) {
        await ctx.reply('❌ Áudio bloqueado por políticas de segurança.');
        return;
      }
      
      const response = await this.agentController.processMessage(userId, sanitized);
      await this.sendResponse(ctx, response);
      
      // Sintetizar e enviar áudio de volta (Apenas para comandos de voz)
      try {
        await ctx.replyWithChatAction('record_voice');
        const audioPath = await this.voiceSynthesizer.synthesize(response);
        await ctx.replyWithVoice(new InputFile(audioPath));
        await fs.promises.unlink(audioPath).catch(() => {});
      } catch (ttsErr: any) {
        console.error('[TelegramInputHandler] Falha ao gerar áudio de resposta:', ttsErr.message);
      }
    } catch (err: any) {
      console.error('[TelegramInputHandler] Erro ao processar áudio:', err.message);
      await ctx.reply('❌ Falha ao processar a mensagem de voz. Verifique os logs.');
    }
  }

  private async handleDocument(ctx: Context): Promise<void> {
    const userId = String(ctx.from?.id ?? '');
    
    if (!this.allowedUserIds.has(userId)) {
      console.warn(`[SECURITY] Documento ignorado de userId não autorizado: ${userId}`);
      return;
    }

    try {
      const document = ctx.message?.document;
      if (!document) return;

      const fileName = document.file_name ?? 'documento.pdf';
      const isPdfOrTxt = fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.txt');
      
      if (!isPdfOrTxt) {
        await ctx.reply('⚠️ Só consigo ingerir arquivos .pdf ou .txt por enquanto.');
        return;
      }

      await ctx.replyWithChatAction('upload_document');
      await ctx.reply(`📥 Baixando e preparando o arquivo *${fileName}*...`, { parse_mode: 'Markdown' });

      const file = await ctx.getFile();
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      
      const knowledgeDir = path.join(__dirname, '..', '..', 'knowledge');
      if (!fs.existsSync(knowledgeDir)) {
        fs.mkdirSync(knowledgeDir, { recursive: true });
      }

      const savePath = path.join(knowledgeDir, fileName);
      
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      await ctx.reply(`🔄 Arquivo recebido. Iniciando a indexação inteligente no RAG... (isso pode levar alguns minutos)`);

      const pythonCmd = 'python ingest.py';
      const rootDir = path.join(__dirname, '..', '..');
      
      exec(pythonCmd, { cwd: rootDir }, async (error, stdout, stderr) => {
        if (error) {
          console.error(`[Ingestion Error]: ${error.message}`);
          await ctx.reply(`❌ Ocorreu um erro ao processar o arquivo *${fileName}*. Verifique os logs da máquina local.`, { parse_mode: 'Markdown' });
          return;
        }
        console.log(`[Ingestion Success]: ${stdout}`);
        await this.agentController.injectSystemContext(userId, `[EVENTO DO SISTEMA] O usuário acabou de enviar e processar o documento "${fileName}" com sucesso na sua base de conhecimento (RAG). Se ele perguntar sobre o "arquivo que enviei", refira-se a este arquivo.`);
        await ctx.reply(`✅ O documento *${fileName}* foi ingerido com sucesso! O DiegoClaw agora possui o conhecimento desse material.`, { parse_mode: 'Markdown' });
      });

    } catch (err: any) {
      console.error('[TelegramInputHandler] Erro ao processar documento:', err.message);
      await ctx.reply('❌ Falha ao processar o documento enviado.');
    }
  }

  private sanitize(message: string): string | null {
    const lower = message.toLowerCase();
    if (INJECTION_PATTERNS.some((p) => lower.includes(p))) {
      console.warn('[SECURITY] Possível tentativa de prompt injection bloqueada');
      return null;
    }
    return message;
  }

  private async sendResponse(ctx: Context, content: string): Promise<void> {
    const MAX_LENGTH = 4096;

    if (content.length <= MAX_LENGTH) {
      await ctx.reply(content, { parse_mode: 'Markdown' });
      return;
    }

    // Chunkar respostas longas
    const chunks = content.match(/[\s\S]{1,4096}/g) ?? [];
    for (const chunk of chunks) {
      await ctx.reply(chunk, { parse_mode: 'Markdown' });
      // Pequena pausa entre chunks para evitar rate limit
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

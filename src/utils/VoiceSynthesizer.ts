import { spawn } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import { OpenAI } from 'openai';

/**
 * VoiceSynthesizer — Síntese de voz neural bidirecional.
 * Utiliza Microsoft Edge TTS v7+ nativo com fallback automático para OpenAI TTS.
 */
export class VoiceSynthesizer {
  private voice: string;
  private openai: OpenAI | null = null;

  constructor(voice: string = 'pt-BR-FranciscaNeural') {
    this.voice = process.env.EDGE_TTS_VOICE || voice;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  /**
   * Sintetiza o texto em áudio e retorna o caminho absoluto do arquivo MP3 temporário.
   */
  public async synthesize(text: string): Promise<string> {
    const tempId = Math.random().toString(36).substring(7);
    const audioPath = path.join(os.tmpdir(), `diegoclaw_voice_${tempId}.mp3`);
    const textPath = path.join(os.tmpdir(), `diegoclaw_text_${tempId}.txt`);

    // 1. Limpeza profunda de markdown e formatação para dicção fluida
    const cleanText = this.sanitizeTextForSpeech(text);

    console.log(`[VoiceSynthesizer] Gerando áudio (${cleanText.length} chars) com voz: ${this.voice}`);

    // 2. Tentar síntese primária via Edge TTS oficial usando arquivo temporário (imune a escape de shell no Windows)
    try {
      await fs.writeFile(textPath, cleanText, 'utf-8');
      await this.synthesizeWithEdgeTTS(textPath, audioPath);
      await fs.unlink(textPath).catch(() => {});
      console.log(`[VoiceSynthesizer] Áudio Edge TTS gerado com sucesso em: ${audioPath}`);
      return audioPath;
    } catch (edgeErr: any) {
      await fs.unlink(textPath).catch(() => {});
      console.warn(`[VoiceSynthesizer] Edge TTS falhou (${edgeErr.message}). Tentando fallback OpenAI TTS...`);
    }

    // 3. Fallback: OpenAI TTS (tts-1)
    if (this.openai) {
      try {
        await this.synthesizeWithOpenAI(cleanText, audioPath);
        console.log(`[VoiceSynthesizer] Áudio OpenAI TTS gerado com sucesso em: ${audioPath}`);
        return audioPath;
      } catch (openAiErr: any) {
        console.error(`[VoiceSynthesizer] Fallback OpenAI TTS também falhou: ${openAiErr.message}`);
        throw openAiErr;
      }
    }

    throw new Error('Não foi possível gerar áudio em nenhum dos provedores de TTS.');
  }

  /**
   * Executa o CLI oficial do edge-tts passando arquivo temporário
   */
  private synthesizeWithEdgeTTS(inputFile: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('edge-tts', [
        '--voice', this.voice,
        '--file', `"${inputFile}"`,
        '--write-media', `"${outputPath}"`
      ], { shell: true });

      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`edge-tts exit code ${code}: ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Fallback com OpenAI TTS (tts-1)
   */
  private async synthesizeWithOpenAI(text: string, outputPath: string): Promise<void> {
    if (!this.openai) throw new Error('OpenAI client não configurado');

    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text.substring(0, 4000),
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(outputPath, buffer);
  }

  /**
   * Remove formatação Markdown, URLs e caracteres que geram ruído na leitura
   */
  private sanitizeTextForSpeech(raw: string): string {
    return raw
      .replace(/```[\s\S]*?```/g, ' [Trecho de código omitido na leitura por voz] ') // blocos de código
      .replace(/`([^`]+)`/g, '$1') // inline code
      .replace(/[*_~]/g, '') // negrito, itálico, tachado
      .replace(/#+\s+/g, '') // títulos
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links markdown
      .replace(/https?:\/\/\S+/g, ' [link] ') // URLs puras
      .replace(/\n+/g, ' ') // quebras de linha em pausas
      .replace(/\s+/g, ' ')
      .trim();
  }
}

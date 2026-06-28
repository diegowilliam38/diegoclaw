import { createReadStream, createWriteStream, promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { OpenAI } from 'openai';

export class AudioTranscriber {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  public async transcribeVoice(fileUrl: string): Promise<string> {
    const tempId = Math.random().toString(36).substring(7);
    const oggPath = path.join(os.tmpdir(), `voice_${tempId}.ogg`);

    try {
      console.log(`[AudioTranscriber] Baixando áudio: ${fileUrl}`);
      // Faz o download do OGG
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      });

      await new Promise<void>((resolve, reject) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on('finish', () => resolve());
        stream.on('error', reject);
      });

      console.log(`[AudioTranscriber] Enviando OGG para Whisper...`);
      // Envia para o Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: createReadStream(oggPath),
        model: 'whisper-1',
        language: 'pt', // Força PT-Br preferencialmente
      });

      return transcription.text;
    } catch (error: any) {
      console.error('[AudioTranscriber] Erro durante a transcrição:', error);
      throw error;
    } finally {
      // Limpeza de arquivos temporários
      await fs.unlink(oggPath).catch(() => {});
    }
  }
}

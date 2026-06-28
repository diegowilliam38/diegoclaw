import { EdgeTTS } from 'node-edge-tts';
import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';

export class VoiceSynthesizer {
  private tts: any;

  constructor(voice: string = 'pt-BR-AntonioNeural') {
    this.tts = new EdgeTTS({
      voice: voice,
      lang: 'pt-BR',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
  }

  /**
   * Sintetiza o texto em áudio e retorna o caminho absoluto do arquivo MP3 temporário.
   */
  public async synthesize(text: string): Promise<string> {
    const tempId = Math.random().toString(36).substring(7);
    const audioPath = path.join(os.tmpdir(), `tts_${tempId}.mp3`);

    // Limpeza pesada de markdown, pois a voz neural tenta ler *asteriscos* e #hashtags
    const cleanText = text
      .replace(/[*_~`]/g, '') // negrito, italico, code
      .replace(/#/g, '') // titulos
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links (mantém só o texto)
      .trim();

    console.log(`[VoiceSynthesizer] Gerando áudio para texto de tamanho ${cleanText.length} caracteres...`);
    
    // Microsoft Edge TTS tem limite de payload. Quebraremos em blocos menores (ex: 2000 chars)
    const chunks = cleanText.match(/[\s\S]{1,2000}(?=\s|$)/g) || [cleanText];
    const chunkPaths: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(os.tmpdir(), `tts_${tempId}_chunk${i}.mp3`);
      await this.tts.ttsPromise(chunks[i], chunkPath);
      chunkPaths.push(chunkPath);
    }

    // MP3 suporta concatenação binária direta
    for (const chunkPath of chunkPaths) {
      const buffer = await fs.readFile(chunkPath);
      await fs.appendFile(audioPath, buffer);
      await fs.unlink(chunkPath).catch(() => {});
    }

    console.log(`[VoiceSynthesizer] Áudio concatenado e gerado com sucesso em: ${audioPath}`);
    
    return audioPath;
  }
}

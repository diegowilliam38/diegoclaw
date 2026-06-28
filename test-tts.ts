import { EdgeTTS } from 'node-edge-tts';

async function test() {
  try {
    const tts = new EdgeTTS({
      voice: 'pt-BR-AntonioNeural',
      lang: 'pt-BR',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
    console.log("Instantiated EdgeTTS");
    await tts.ttsPromise("Olá, este é um teste de voz usando Edge TTS.", "test_audio.mp3");
    console.log("Success");
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
test();

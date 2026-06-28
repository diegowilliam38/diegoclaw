import { EdgeTTS } from 'node-edge-tts';

async function test() {
  try {
    const tts = new EdgeTTS({
      voice: 'pt-BR-AntonioNeural',
      lang: 'pt-BR',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
    
    // Simulate long text
    let longText = '';
    for(let i=0; i<500; i++) {
        longText += "Esta é uma frase de teste muito longa para o edge tts processar. ";
    }
    
    await tts.ttsPromise(longText, "test_audio.mp3");
    console.log("Success");
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
test();

# Spec: 008-voice-engine-resilience

## 1. Responsáveis
- **Owner**: `@architect` / `@dev`
- **Revisão Técnica**: `@qa` / `@security-auditor`
- **Camada**: Core System / Utils / Bot

## 2. Objetivo Técnico
Refatorar a classe `VoiceSynthesizer` para contornar a depreciação e bloqueio de protocolo da biblioteca `node-edge-tts` (`HTTP 403`), implementando uma esteira de síntese resiliente com Edge-TTS CLI v7+ via `spawn` seguro e fallback transparente para OpenAI TTS (`tts-1`). Modularizar a resposta de voz em `TelegramInputHandler` para suportar comandos textuais sob demanda.

## 3. Implementação

### 3.1. `src/utils/VoiceSynthesizer.ts`
- Substituição do proxy de socket por chamada de processo com parâmetro `--file` e `--write-media`.
- Gravação prévia de arquivo temporário UTF-8 para evitar limites de buffer de shell e problemas de escape de aspas no Windows.
- Fallback em caso de erro para `this.openai.audio.speech.create({ model: 'tts-1', voice: 'alloy', input })`.
- Sanitização profunda de texto removendo markdown (`*`, `#`, links e code blocks) antes da síntese neural.

### 3.2. `src/bot/TelegramInputHandler.ts`
- Extração da função privada `sendVoiceResponse(ctx: Context, response: string): Promise<void>`.
- Em `handleTextMessage`, detecção via regex de intenções de voz:  
  `/(em áudio|em audio|por áudio|por audio|em voz|mande áudio|mande audio|manda áudio|manda audio|fale em áudio|fale em audio|grave um áudio|grave um audio|responda em áudio|responda em audio)/i` ou comandos `/audio` e `/voz`.
- Em `handleVoiceMessage`, envio garantido de texto + áudio sintetizado.

## 4. Matriz de Verificação Binária (Critérios Pass/Fail)

| ID | Teste | Resultado Esperado | Status |
|---|---|---|---|
| T1 | Síntese Edge-TTS nativa | Geração de MP3 > 1KB sem erro 403 | PASS |
| T2 | Fallback OpenAI TTS | Geração de áudio caso Edge-TTS falhe | PASS |
| T3 | Resposta a áudio no Telegram | Envio de áudio + texto após transcrição Whisper | PASS |
| T4 | Resposta sob demanda por texto | Envio de áudio ao solicitar com `/audio` ou `em áudio` | PASS |
| T5 | Type check TypeScript | `tsc --noEmit` com código 0 | PASS |

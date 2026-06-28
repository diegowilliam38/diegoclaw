# Spec: 005-voice-interaction

## 1. Responsáveis
- **Owner**: `@architect`
- **Revisão Técnica**: `@qa`
- **Camada**: Core System / Utils / Telegram

## 2. Objetivo Técnico
Introduzir uma classe `VoiceSynthesizer` independente que fará proxy com a biblioteca `node-edge-tts`, retornando caminhos de áudio em buffer/arquivo temporário para posterior despacho via Grammy.js no Telegram.

## 3. Implementação Proposta

### 3.1. `src/utils/VoiceSynthesizer.ts`
- Utilizar pacote `node-edge-tts`.
- Método `synthesize(text: string): Promise<string>`:
  1. Sanitiza a string (remoção pesada de markdown, emojis complexos e links).
  2. Inicializa o EdgeTTS com a voz `pt-BR-AntonioNeural`.
  3. Salva o output na pasta `os.tmpdir()` com nome único.
  4. Retorna o absolute path do mp3.

### 3.2. `src/bot/TelegramInputHandler.ts`
- Modificar o método `handleVoiceMessage`:
  - Após `sendResponse(ctx, response)`, acionar `VoiceSynthesizer`.
  - Sinalizar "gravando áudio" via `ctx.replyWithChatAction('record_voice')`.
  - Enviar com `ctx.replyWithVoice({ source: audioPath })`.
  - Excluir o MP3 temporário logo em seguida para não vazar disco.

## 4. Dependências
- `npm install node-edge-tts`

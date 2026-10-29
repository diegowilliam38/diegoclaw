# Story: 008-voice-engine-resilience

## 1. Visão Geral
**Como** usuário do DiegoClaw operando via Telegram (seja por voz ou por texto),  
**Eu quero** que a síntese de voz seja resiliente, de alta qualidade e que o agente possa responder em áudio tanto a mensagens de voz quanto a comandos de texto sob demanda,  
**Para que** eu nunca enfrente falhas silenciosas de TTS (como o erro 403 da Microsoft) e possa alternar entre voz e texto com total flexibilidade.

## 2. Contexto de Engenharia & Negócio
A biblioteca legada `node-edge-tts` sofria de obsolescência de protocolo WebSocket (`HTTP 403 Forbidden`). Para garantir nível de produção enterprise exigido na submissão da UFG, implementou-se uma arquitetura de voz com dupla camada: Edge-TTS CLI v7+ oficial (alta velocidade e gratuidade) com fallback automático para OpenAI TTS (`tts-1`). Além disso, estendeu-se a interface conversacional para sintetizar voz não apenas em mensagens de áudio, mas também quando o usuário solicitar explicitamente por texto (`/audio`, `/voz` ou linguagem natural).

## 3. Critérios de Aceite
- [x] O `VoiceSynthesizer` deve utilizar Edge-TTS v7+ nativo com voz `pt-BR-FranciscaNeural`.
- [x] Se o Edge-TTS falhar, o sistema deve acionar automaticamente a OpenAI TTS (`tts-1`) como fallback de alta disponibilidade.
- [x] A passagem de texto para o Edge-TTS deve ser feita via arquivo temporário para imunidade contra quebras de escape de shell no Windows.
- [x] Mensagens de voz recebem resposta em texto e áudio de volta.
- [x] Mensagens de texto contendo comandos ou intenções de voz (`/audio`, `/voz`, `em áudio`) ativam a síntese e despacho de áudio.
- [x] Validação estática de tipagem TypeScript com 100% de sucesso (`tsc --noEmit`).

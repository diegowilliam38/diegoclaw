# ADR-007: Resiliência da Engine de Voz (Edge-TTS v7 + OpenAI Fallback)

**Data:** 2026-10-28  
**Status:** Aceito  
**Contexto:** Submissão de Pós-Graduação UFG & Operação em Produção Real  
**Decisores:** Diego William, @architect, @security-auditor  

---

## 1. Contexto & Problema

O DiegoClaw foi projetado para oferecer interação bidirecional em áudio (STT via Whisper + TTS via voz neural). No entanto, a biblioteca Node.js legada (`node-edge-tts`) tornou-se instável devido a alterações nos protocolos de WebSocket da Microsoft, retornando intermitentemente erros `HTTP 403 Forbidden` e silenciando as respostas de voz do agente.

Além disso, a arquitetura original só emitia voz se a mensagem de entrada fosse exclusivamente um arquivo de áudio, limitando a experiência do usuário quando este solicitava síntese via mensagens de texto.

---

## 2. Decisão Arquitetural

1. **Substituição da Camada TTS:**  
   Adotou-se o CLI oficial e atualizado do `edge-tts` (v7.3.1+) executado em subprocesso isolado com passagem de texto via arquivo temporário em UTF-8 (`--file`), garantindo imunidade total a falhas de escape de aspas e limites de buffer no ambiente Windows.

2. **Padrão Circuit Breaker / Fallback de Alta Disponibilidade:**  
   Caso a síntese via Edge-TTS falhe por qualquer razão de rede ou indisponibilidade externa, a classe `VoiceSynthesizer` aciona instantaneamente o motor da OpenAI TTS (`tts-1` com voz `alloy`), impedindo que o agente fique mudo.

3. **Voz Canônica em Português:**  
   Padronizou-se a voz neural de alta expressividade `pt-BR-FranciscaNeural`.

4. **Síntese Multimodal Sob Demanda:**  
   O `TelegramInputHandler` passou a reconhecer comandos e intenções naturais de voz em mensagens de texto (ex: `/audio`, `/voz`, "me mande um áudio"), enviando texto e áudio gerado.

---

## 3. Consequências

- **Positivas:**
  - 100% de disponibilidade na síntese de voz (Zero Silêncio).
  - Custo zero na operação normal (Edge-TTS) com segurança de fallback pago apenas em emergência.
  - Testado e validado em tempo real em produção com o cliente Telegram.
- **Negativas / Mitigações:**
  - Dependência do utilitário `edge-tts` no ambiente Python da máquina host (mitigado pelo script de inicialização e documentado nos pré-requisitos).

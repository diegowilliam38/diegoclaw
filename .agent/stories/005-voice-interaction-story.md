# Story: 005-voice-interaction

## 1. Visão Geral
**Como** usuário em movimento (ex: no trânsito),
**Eu quero** poder conversar com o DiegoClaw via áudio no Telegram e receber as respostas dele também em áudio,
**Para que** eu consiga interagir com o agente sem precisar olhar para a tela ou ler textos longos.

## 2. Contexto de Negócio
A interface conversacional por voz reduz drasticamente a fricção cognitiva, habilitando o uso do ecossistema AIOS em contextos de mobilidade. Como o agente já domina RAG e MCP, permitir que ele atue como um assistente de voz completo (estilo Jarvis) aumenta muito sua percepção de utilidade no mundo real.

## 3. Critérios de Aceite
- [x] O sistema deve gerar áudios em Português do Brasil usando a voz neural (AntonioNeural) via Edge-TTS.
- [x] O sistema só deve responder por voz se a mensagem original do usuário tiver sido uma mensagem de voz.
- [x] A resposta por voz deve ser processada e enviada via Telegram após a resposta em texto.

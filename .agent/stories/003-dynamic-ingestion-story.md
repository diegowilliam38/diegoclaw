# Story: 003-dynamic-ingestion

## 1. Visão Geral
**Como** usuário do ecossistema AIOS (Diego William),
**Eu quero** enviar documentos e PDFs diretamente para o chat do bot DiegoClaw no Telegram,
**Para que** ele ingira o conhecimento na sua base RAG imediatamente sem que eu precise usar scripts de terminal.

## 2. Contexto de Negócio
O bot já possui uma base de dados ChromaDB consolidada e os scripts de ingestão (python) funcionam perfeitamente. Contudo, a alimentação de novos dados ainda é uma barreira (fricção). Tornar essa funcionalidade nativa no canal de comunicação (Telegram) transforma o bot num verdadeiro "Segundo Cérebro" Always-On.

## 3. Critérios de Aceite
- [x] O bot deve interceptar o envio de arquivos do tipo "Documento" (PDF e TXT).
- [x] O bot deve rejeitar outros formatos suavemente.
- [x] O bot deve baixar o arquivo de forma segura para o diretório `knowledge/`.
- [x] O bot deve disparar o pipeline de ingestão Python no background e notificar o usuário quando terminar.

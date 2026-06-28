# Spec: 003-dynamic-ingestion

## 1. Responsáveis
- **Owner**: `@dev`
- **Revisão Técnica**: `@architect`
- **Camada**: Core System / Interfaces

## 2. Objetivo Técnico
Modificar o `TelegramInputHandler.ts` para processar o webhook/polling de documentos do Telegram via `grammy`, fazer download assíncrono do binário usando `axios` e `fs`, e instanciar o pipeline de dados RAG (`ingest.py`) via subprocesso (`child_process.exec`).

## 3. Implementação Proposta
**Alvo**: `src/bot/TelegramInputHandler.ts`

### 3.1. Handler Grammy
- Registrar listener para `message:document`.
- Extrair mime_type e nome do arquivo.
- Validar se termina em `.pdf` ou `.txt`.

### 3.2. Download Seguro
- Utilizar `ctx.getFile()` para obter o File Path.
- Construir a URL de download oficial: `https://api.telegram.org/file/bot<TOKEN>/<FILE_PATH>`.
- Fazer request com `axios({ responseType: 'stream' })` e escrever para `./knowledge/<nome_limpo>.pdf`.

### 3.3. Disparo do Pipeline e Resiliência
- Como a ingestão via `python ingest.py` pode levar de segundos a minutos, utilizar o método assíncrono padrão.
- Retornar status "Iniciando processamento" antes do spawn.
- Na callback de `exec`, capturar stdout/stderr e notificar o chat com o sucesso/falha do RAG.

## 4. Testabilidade
**Testabilidade**: Enviar um PDF pequeno. Verificar se o bot responde com a notificação de processamento, depois se surge o arquivo no file system, e por último se responde "concluído".

# Spec Técnica: Ingestão RAG e Testes
**ID:** 001-rag-ingestion
**Author:** @architect / @dev
**Date:** 2026-06-27

## Arquitetura de Ação
Esta spec não produzirá código no diretório `/src`, mas definirá os passos operativos estritos para operar a infraestrutura de dados local.

## Passo a Passo Operacional
1. Inicializar ChromaDB Server
   - Executar `start_rag_server.bat` localmente (via Docker)
   - Assegurar porta 8002 disponível.

2. Disparar processo de Ingestão
   - Executar `ingest_knowledge.bat` ou `python ingest.py` diretamente, acompanhando output até a conclusão.
   
3. Validar Banco 
   - Checar estado do banco ChromaDB para confirmar dados no dir `chroma_db`

4. Testar Bot 
   - `start_diegoclaw_local.bat` para levantar o bot
   - Executar interação teste no expert mode.

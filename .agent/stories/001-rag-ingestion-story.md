# Story: Ingestão de Conhecimento e Teste RAG
**ID:** 001-rag-ingestion
**Author:** @sm
**Date:** 2026-06-27

## Contexto
O projeto DiegoClaw está com o seu arcabouço pronto, as 8 skills foram criadas e o modo RAG Expert Mode foi ativado. Falta finalizar o processo populando a base de dados (ChromaDB) com os 55 livros mapeados em `/knowledge` e realizar o start/test da base para confirmar que o chatbot funciona plenamente lendo a base vetorizada.

## Critérios de Aceite
- Os 55 livros devem ser ingeridos usando o modelo text-embedding-3-small (via script `ingest.py` existente).
- O banco ChromaDB deve ser inicializado.
- Deve ser possível confirmar que a coleção contém vetores no final do processo.
- O chatbot deve funcionar, respondendo sem erros no terminal ou no Telegram e puxando respostas da base quando estimulado.

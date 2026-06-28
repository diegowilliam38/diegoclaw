@echo off
title DiegoClaw — Ingestao RAG
echo ============================================================
echo  DiegoClaw — Ingestao da Base de Conhecimento (RAG)
echo  55 obras tech prontas em knowledge/
echo  Estimativa: 30-90 minutos (dependendo da OpenAI API)
echo ============================================================
echo.
echo  IMPORTANTE: Ingestao eh incremental!
echo  Arquivos ja indexados serao ignorados.
echo  Pode rodar novamente sem problemas.
echo.
echo  Nao precisa de ChromaDB server para ingestao —
echo  usa PersistentClient diretamente em ./chroma_db
echo.
pause

echo.
echo [*] Iniciando ingestao com Python...
echo.
python ingest.py %*

echo.
echo ============================================================
echo  Concluido! Agora inicie o bot completo:
echo    1. start_rag_server.bat  (ChromaDB HTTP)
echo    2. start_diegoclaw_local.bat  (Bot Telegram)
echo ============================================================
pause

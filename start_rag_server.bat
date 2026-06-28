@echo off
title DiegoClaw — ChromaDB Server
echo ============================================================
echo  DiegoClaw — Servidor ChromaDB v1.5
echo  Porta: http://localhost:8000
echo  Banco: ./chroma_db
echo ============================================================
echo.
echo  Deixe esta janela ABERTA enquanto o bot estiver rodando.
echo  Para fechar: Ctrl+C
echo.

echo  Aguardando Docker Desktop...
docker run -p 8002:8000 -v "%cd%/chroma_db:/chroma/chroma" chromadb/chroma

pause

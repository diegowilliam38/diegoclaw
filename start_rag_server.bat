@echo off
title DiegoClaw — ChromaDB Server
cd /d "%~dp0"
echo ============================================================
echo   DiegoClaw — Servidor ChromaDB v1.5 (Nativo Local)
echo   Porta: http://localhost:8002
echo   Banco: ./chroma_db (25.545 chunks)
echo ============================================================
echo.
echo   Deixe esta janela ABERTA enquanto o bot estiver rodando.
echo   Para fechar: Ctrl+C ou feche a janela.
echo.

python chroma_server.py

pause

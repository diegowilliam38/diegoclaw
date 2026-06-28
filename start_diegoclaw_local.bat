@echo off
title DiegoClaw - Segundo Cerebro (Local)
echo ==========================================
echo  DiegoClaw — Startup Script v3
echo  RAG: ChromaDB Embedded (sem servidor!)
echo ==========================================

echo [1] Encerrando processos Node orfaos (evita Error 409)...
taskkill /f /im node.exe >nul 2>&1
echo     OK.

echo.
echo [2] Iniciando DiegoClaw Bot (modo dev - ts-node)...
echo     Comando: npm run dev
echo.
start "Bot DiegoClaw" cmd /k "title DiegoClaw Bot && cd /d "%~dp0" && npm run dev"

echo.
echo ==========================================
echo  Bot iniciado! Verifique a janela aberta.
echo  Aguarde: "DiegoClaw online!"
echo.
echo  [RAG] Se a base estiver vazia, execute:
echo    ingest_knowledge.bat
echo ==========================================
pause

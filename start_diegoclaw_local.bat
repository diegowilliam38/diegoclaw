@echo off
title DiegoClaw - Segundo Cerebro (Local)
cd /d "%~dp0"
echo ==========================================
echo   DiegoClaw — Startup Script v3
echo   RAG: ChromaDB Local (Porta 8002)
echo ==========================================

echo.
echo [1] Encerrando eventuais processos Node orfaos (evita Error 409)...
taskkill /f /im node.exe >nul 2>&1
echo     Concluido.

echo.
echo [2] Iniciando DiegoClaw Bot (modo dev)...
echo     Executando: npm run dev
echo.

npm run dev

pause

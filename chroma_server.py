#!/usr/bin/env python3
"""
DiegoClaw — Servidor ChromaDB
Roda em modo persistente na porta 8000.
Usa PersistentClient + FastAPI nativo do ChromaDB.

Uso: python chroma_server.py
"""
import chromadb
import sys
import os

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")

print("=" * 50)
print("  DiegoClaw — ChromaDB Server")
print(f"  Persistindo em: {CHROMA_PATH}")
print(f"  Endereço: http://localhost:8000")
print("=" * 50)

# Garantir que a pasta existe
os.makedirs(CHROMA_PATH, exist_ok=True)

# Iniciar servidor HTTP do ChromaDB com persistência
chromadb.cli.cli.run_app(
    path=CHROMA_PATH,
    host="localhost",
    port=8000,
    log_path=None,
    test=False,
)

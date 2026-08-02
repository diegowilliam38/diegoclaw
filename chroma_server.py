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
print("  DiegoClaw -- ChromaDB Server")
print("  Persistindo em ./chroma_db")
print("  Endereco: http://localhost:8002")
print("=" * 50)

import uvicorn
from chromadb.app.fastapi import app

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8002)

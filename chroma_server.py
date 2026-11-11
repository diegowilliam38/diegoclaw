#!/usr/bin/env python3
"""
DiegoClaw — Servidor ChromaDB
Inicia o servidor ChromaDB nativo na porta 8002 persistindo em ./chroma_db.
Compatível com ChromaDB 1.5+ (sem necessidade de Docker).
"""
import sys
import os
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")

print("=" * 60)
print("  🦾 DiegoClaw — Servidor ChromaDB v1.5 (Nativo)")
print(f"  📁 Base Vetorial: {CHROMA_PATH}")
print("  🌐 Endereço: http://localhost:8002")
print("=" * 60)
print("  Pressione Ctrl+C para encerrar.\n")

cmd = [sys.executable, "-m", "chromadb.cli.cli", "run", "--path", CHROMA_PATH, "--port", "8002", "--host", "localhost"]

try:
    subprocess.run(cmd, check=True)
except KeyboardInterrupt:
    print("\n[ChromaDB] Servidor finalizado com sucesso.")
except Exception as e:
    # Fallback para comando chroma direto
    try:
        subprocess.run(["chroma", "run", "--path", CHROMA_PATH, "--port", "8002", "--host", "localhost"], check=True)
    except Exception as err:
        print(f"\n❌ Erro ao iniciar ChromaDB: {err}")

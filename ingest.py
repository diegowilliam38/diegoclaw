#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DiegoClaw -- Ingestao de Conhecimento RAG
Processa todos os PDFs em knowledge/ e indexa no ChromaDB (PersistentClient).

Uso:
  python ingest.py              -> ingere arquivos novos (incremental)
  python ingest.py --status     -> mostra estatisticas da base
  python ingest.py --force      -> re-ingere tudo (limpa e reindexa)
"""
import os
import sys
import hashlib
import re
from datetime import date
import chromadb
from chromadb import HttpClient
from openai import OpenAI

# Forcar saida UTF-8 no Windows (comentado para evitar crash)
# if sys.platform == "win32":
#     import io
#     sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
#     sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

try:
    import pypdf
    USE_PYPDF = True
except ImportError:
    USE_PYPDF = False

try:
    from pdfminer.high_level import extract_text as pdfminer_extract
    USE_PDFMINER = True
except ImportError:
    USE_PDFMINER = False

try:
    import docx
    USE_DOCX = True
except ImportError:
    USE_DOCX = False

# Carregar .env manualmente (sem dependencia de python-dotenv)
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    with open(dotenv_path, encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "knowledge")
COLLECTION_NAME = "diegoclaw_knowledge"
BATCH_SIZE = 20

FAST_EVOLVING_TOPICS = [
    "langchain", "langgraph", "crewai", "llm", "llms", "openai", "gpt",
    "kubernetes", "k8s", "docker", "fastapi", "react", "next.js",
    "spark", "databricks", "delta lake", "chromadb", "mcp",
    "agentes", "agents", "rag", "embeddings"
]

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

try:
    chroma_client = HttpClient(host='localhost', port=8002)
    chroma_client.heartbeat()
except Exception:
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)


def is_fast_evolving(filename: str) -> bool:
    """Detecta se o arquivo cobre topicos de evolucao rapida."""
    lower = filename.lower()
    return any(topic in lower for topic in FAST_EVOLVING_TOPICS)


def get_embeddings(texts: list) -> list:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [item.embedding for item in response.data]


def extract_text(filepath: str) -> str:
    ext = filepath.lower()
    if ext.endswith('.txt'):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    if ext.endswith('.docx'):
        if USE_DOCX:
            doc = docx.Document(filepath)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text)
            for table in doc.tables:
                for row in table.rows:
                    row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_text:
                        full_text.append(" | ".join(row_text))
            return "\n".join(full_text)
        raise RuntimeError("Nenhum parser DOCX disponivel. Instale: pip install python-docx")
    if ext.endswith('.pdf'):
        text = ""
        if USE_PYPDF:
            from pypdf import PdfReader
            reader = PdfReader(filepath)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        elif USE_PDFMINER:
            text = pdfminer_extract(filepath)
        
        # Se o texto extraido for muito curto (PDF escaneado / imagens do Kindle), usar PyMuPDF + Tesseract OCR
        if len(text.strip()) < 100:
            try:
                import fitz  # PyMuPDF
                import pytesseract
                from PIL import Image
                import io

                doc = fitz.open(filepath)
                ocr_texts = []
                for page_idx in range(len(doc)):
                    page = doc[page_idx]
                    pix = page.get_pixmap(dpi=150)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    page_text = pytesseract.image_to_string(img, lang='por+eng')
                    if page_text.strip():
                        ocr_texts.append(page_text.strip())
                if ocr_texts:
                    text = "\n".join(ocr_texts)
            except Exception as e:
                pass

        return text


MAX_CHUNK_CHARS = 6000  # ~1500 tokens — bem abaixo do limite de 8192 da API

def chunk_text(text: str, min_len: int = 150) -> list:
    """Divide por paragrafos duplos, filtra chunks curtos e quebra chunks gigantes."""
    raw_chunks = re.split(r'\n\s*\n', text)
    result = []
    for c in raw_chunks:
        c = re.sub(r'\s+', ' ', c).strip()
        if len(c) < min_len:
            continue
        # Sub-dividir chunks gigantes por sentenca
        if len(c) > MAX_CHUNK_CHARS:
            sentences = re.split(r'(?<=[.!?])\s+', c)
            current = ""
            for sent in sentences:
                if len(current) + len(sent) > MAX_CHUNK_CHARS:
                    if current:
                        result.append(current.strip())
                    current = sent
                else:
                    current += " " + sent
            if current.strip():
                result.append(current.strip())
        else:
            result.append(c)
    return result


def show_status(collection):
    count = collection.count()
    results = collection.get(include=["metadatas"])
    sources = {}
    fast_evolving_count = 0

    if results["metadatas"]:
        for meta in results["metadatas"]:
            if meta and "source" in meta:
                src = meta["source"]
                if src not in sources:
                    sources[src] = meta.get("ingestion_date", "desconhecida")
                if meta.get("fast_evolving", False):
                    fast_evolving_count += 1

    print("\n+--------------------------------------------------+")
    print("|        DiegoClaw -- RAG Knowledge Status         |")
    print("+--------------------------------------------------+")
    print(f"|  Total de chunks   : {str(count).ljust(28)}|")
    print(f"|  Obras indexadas   : {str(len(sources)).ljust(28)}|")
    print(f"|  Chunks fast-evolv : {str(fast_evolving_count).ljust(28)}|")
    print("+--------------------------------------------------+")
    if sources:
        print("|  Obras e data de ingestao:                       |")
        for src, dt in sorted(sources.items()):
            safe_src = src.encode('ascii', 'replace').decode('ascii')[:30]
            line = f"  * {safe_src} ({dt})"
            print(f"|  {line.ljust(48)}|")
    print("+--------------------------------------------------+\n")


def ingest(force: bool = False):
    print("\n[ChromaDB] Conectando ao banco | DB_PATH: ./chroma_db")
    collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)

    if force:
        print("[!] Modo --force: limpando colecao existente...")
        chroma_client.delete_collection(name=COLLECTION_NAME)
        collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)

    # Fontes ja indexadas
    existing_sources = set()
    try:
        results = collection.get(include=["metadatas"])
        if results["metadatas"]:
            for meta in results["metadatas"]:
                if meta and "source" in meta:
                    existing_sources.add(meta["source"])
    except Exception:
        pass

    print(f"[*] Chunks ja indexados : {collection.count()}")
    print(f"[*] Fontes ja indexadas : {len(existing_sources)}\n")

    all_files = [
        f for f in os.listdir(KNOWLEDGE_DIR)
        if (f.endswith('.pdf') or f.endswith('.txt') or f.endswith('.docx')) and not f.startswith('GAPS')
    ]
    new_files = [f for f in all_files if f not in existing_sources]

    if not new_files:
        print("[OK] Nenhum arquivo novo! Base ja esta atualizada.")
        show_status(collection)
        return

    print(f"[*] {len(new_files)} arquivo(s) novo(s) para ingerir de {len(all_files)} total.")
    print("-" * 60)

    # Data de hoje para metadado de ingestao (Mecanismo 2 -- Knowledge Currency)
    today = date.today().isoformat()

    success, errors = 0, 0

    for i, filename in enumerate(new_files):
        progress = f"[{i+1}/{len(new_files)}]"
        # Remover caracteres nao-ascii no log para evitar crash no Windows stdout
        safe_filename = filename.encode('ascii', 'replace').decode('ascii')
        print(f"\n{progress} Processando: {safe_filename}")
        filepath = os.path.join(KNOWLEDGE_DIR, filename)

        # Detectar se e topico de rapida evolucao (Mecanismo 2)
        fast_evolving = is_fast_evolving(filename)
        if fast_evolving:
            print("    [!] Topico de evolucao rapida -- sera flagrado nos metadados")

        try:
            text = extract_text(filepath)
            chunks = chunk_text(text)

            if not chunks:
                print("    [!] Nenhum trecho util. Pulando.")
                continue

            print(f"    -> {len(chunks)} trechos para indexar...")

            for j in range(0, len(chunks), BATCH_SIZE):
                batch_texts = chunks[j:j + BATCH_SIZE]
                batch_ids = [
                    hashlib.md5(f"{filename}_{j+k}".encode()).hexdigest()
                    for k in range(len(batch_texts))
                ]
                # Metadados enriquecidos -- Mecanismo 2: ingestion_date + fast_evolving
                doc_type = "note" if filename.endswith('.txt') else ("docx_document" if filename.endswith('.docx') else "technical_book")
                batch_metas = [
                    {
                        "source": filename,
                        "type": doc_type,
                        "ingestion_date": today,
                        "fast_evolving": fast_evolving,
                    }
                    for _ in batch_texts
                ]
                embeddings = get_embeddings(batch_texts)
                collection.add(
                    ids=batch_ids,
                    metadatas=batch_metas,
                    documents=batch_texts,
                    embeddings=embeddings
                )
                pct = int(((j + len(batch_texts)) / len(chunks)) * 100)
                done = min(j + BATCH_SIZE, len(chunks))
                print(f"\r    -> Progresso: {pct}% ({done}/{len(chunks)})", end="", flush=True)

            tag = " [fast-evolving]" if fast_evolving else ""
            print(f"\n    [OK] Concluido: {safe_filename}{tag}")
            success += 1

        except Exception as e:
            safe_err = str(e).encode('ascii', 'replace').decode('ascii')
            print(f"\n    [ERRO] {safe_filename}: {safe_err}")
            errors += 1

    print("\n" + "=" * 60)
    print(f"[OK] Ingestao finalizada! Sucesso: {success} | Erros: {errors}")
    show_status(collection)


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--status" in args:
        collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
        show_status(collection)
    elif "--force" in args:
        ingest(force=True)
    else:
        ingest(force=False)

"""
ingest_all.py — Ingestão completa de todos os PDFs da pasta knowledge/
Usa ChromaDB PersistentClient (sem servidor) + OpenAI text-embedding-3-small
"""
import os
import sys
import json
import time
import chromadb
from openai import OpenAI
import glob

# ── Configuração ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(SCRIPT_DIR, '..', '..')
KNOWLEDGE_DIR = os.path.join(PROJECT_DIR, 'knowledge')
# Usar um caminho fora do OneDrive para evitar problemas de trava de sincronização com o ChromaDB (HNSW index)
DB_PATH = os.path.join(os.environ.get('USERPROFILE', 'C:\\'), 'diegoclaw_db')
# Caso prefira manter no projeto, descomente os abaixo (mas pode corromper no OneDrive):
# DB_PATH = os.path.join(PROJECT_DIR, 'chroma_db')

# ── Mapeamento de Tópicos por palavras-chave no nome do arquivo ───────────────
def detect_topic(filename: str) -> tuple[str, str]:
    """Retorna (topic, author) baseado no nome do arquivo."""
    name = filename.lower()
    
    if 'rag' in name:
        return 'RAG/Retrieval-Augmented Generation', 'Sandeco'
    elif 'crewai' in name or 'crew' in name:
        return 'Agentes IA / CrewAI', 'Sandeco'
    elif 'langchain' in name:
        return 'LangChain / Frameworks IA', 'Sandeco'
    elif 'agentes' in name or 'autonomos' in name or 'multiagentes' in name:
        return 'Agentes Autônomos IA', 'IA/Engineering'
    elif 'llm' in name or 'adocao' in name:
        return 'LLMs Enterprise', 'IA/Engineering'
    elif 'prompt' in name or 'prompts' in name:
        return 'Engenharia de Prompts', 'IA/Engineering'
    elif 'python' in name:
        return 'Python / Programação', 'O\'Reilly'
    elif 'docker' in name or 'kubernetes' in name:
        return 'DevOps / Infraestrutura', 'Engineering'
    elif 'spark' in name or 'delta' in name or 'databricks' in name:
        return 'Engenharia de Dados / Spark', 'O\'Reilly'
    elif 'sql' in name or 'postgres' in name:
        return 'Banco de Dados / SQL', 'Engineering'
    elif 'fastapi' in name:
        return 'APIs / FastAPI', 'Engineering'
    elif 'etl' in name or 'dados' in name or 'fundamentos' in name:
        return 'Engenharia de Dados', 'Engineering'
    elif 'segurança' in name or 'seguranca' in name or 'defensiva' in name:
        return 'Segurança Defensiva', 'Engineering'
    elif 'mcp' in name:
        return 'MCP / Model Context Protocol', 'IA/Engineering'
    elif 'ia generativa' in name or 'generativa' in name:
        return 'IA Generativa', 'IA/Engineering'
    elif 'vibecoding' in name or 'programacao' in name or 'assistida' in name:
        return 'Programação com IA', 'Engineering'
    elif 'produto' in name or 'negocios' in name:
        return 'Produtos com IA / Negócios', 'Product'
    elif 'contexto' in name or 'observabilidade' in name:
        return 'Observabilidade / Engenharia de Contexto', 'Engineering'
    elif 'design' in name or 'dominio' in name or 'padroes' in name:
        return 'Design / Arquitetura de Software', 'Engineering'
    elif 'software' in name:
        return 'Engenharia de Software', 'Engineering'
    else:
        return 'Conhecimento Técnico Geral', 'Engineering'


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """Divide texto em chunks com overlap."""
    # Primeiro tenta dividir por parágrafos
    paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 80]
    
    chunks = []
    current_chunk = []
    current_len = 0
    
    for para in paragraphs:
        if current_len + len(para) > chunk_size and current_chunk:
            chunks.append(' '.join(current_chunk))
            # Overlap: mantém último parágrafo
            current_chunk = current_chunk[-1:] if current_chunk else []
            current_len = sum(len(p) for p in current_chunk)
        
        current_chunk.append(para)
        current_len += len(para)
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks


def get_already_ingested(collection) -> set[str]:
    """Retorna set de source files já ingeridos."""
    try:
        all_items = collection.get(limit=10000, include=['metadatas'])
        sources = set()
        if all_items['metadatas']:
            for meta in all_items['metadatas']:
                if meta and 'source' in meta:
                    sources.add(meta['source'])
        return sources
    except:
        return set()


def ingest_pdf(pdf_path: str, collection, openai_client: OpenAI, already_ingested: set):
    import pdfminer.high_level as pdfminer
    
    filename = os.path.basename(pdf_path)
    
    if filename in already_ingested:
        print(f"  [SKIP] {filename} — já ingerido anteriormente")
        return 0
    
    topic, author = detect_topic(filename)
    
    print(f"\n📚 Processando: {filename}")
    print(f"   Tópico: {topic} | Autor: {author}")
    
    # Extrair texto do PDF
    try:
        text = pdfminer.extract_text(pdf_path)
        if not text or len(text.strip()) < 100:
            print(f"  [WARN] PDF vazio ou sem texto extraível: {filename}")
            return 0
    except Exception as e:
        print(f"  [ERRO] Falha ao ler PDF {filename}: {e}")
        return 0
    
    chunks = chunk_text(text)
    print(f"   → {len(chunks)} chunks gerados")
    
    # Processar em batches de 20
    BATCH_SIZE = 20
    total_added = 0
    
    for i in range(0, len(chunks), BATCH_SIZE):
        batch_texts = chunks[i:i + BATCH_SIZE]
        batch_ids = [f"{filename}_chunk_{i + j}" for j in range(len(batch_texts))]
        batch_metas = [{
            'source': filename,
            'author': author,
            'topic': topic,
            'type': 'technical_book',
            'chunk_index': i + j
        } for j in range(len(batch_texts))]
        
        # Gerar embeddings
        try:
            resp = openai_client.embeddings.create(
                model='text-embedding-3-small',
                input=batch_texts
            )
            embeddings = [r.embedding for r in resp.data]
        except Exception as e:
            print(f"  [ERRO] Embedding batch {i//BATCH_SIZE + 1}: {e}")
            time.sleep(3)
            continue
        
        # Salvar no ChromaDB
        try:
            collection.add(
                ids=batch_ids,
                documents=batch_texts,
                embeddings=embeddings,
                metadatas=batch_metas
            )
            total_added += len(batch_texts)
        except Exception as e:
            print(f"  [ERRO] ChromaDB add batch {i//BATCH_SIZE + 1}: {e}")
        
        # Rate limit: pausa entre batches
        time.sleep(0.3)
        print(f"   ✓ Batch {i//BATCH_SIZE + 1}/{(len(chunks) + BATCH_SIZE - 1)//BATCH_SIZE} ({total_added} chunks)")
    
    print(f"   ✅ CONCLUÍDO: {total_added} chunks adicionados de '{filename}'")
    return total_added


def main():
    print("=" * 60)
    print("🚀 DiegoClaw — Ingestão Completa da Biblioteca")
    print("=" * 60)
    
    # Verificar OPENAI_API_KEY
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        # Tentar ler do .env manualmente
        env_path = os.path.join(PROJECT_DIR, '.env')
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith('OPENAI_API_KEY='):
                        api_key = line.strip().split('=', 1)[1].strip().strip('"').strip("'")
                        os.environ['OPENAI_API_KEY'] = api_key
                        break
    
    if not api_key:
        print("❌ ERRO: OPENAI_API_KEY não encontrada. Adicione ao .env")
        sys.exit(1)
    
    # Inicializar clientes
    openai_client = OpenAI(api_key=api_key)
    chroma_client = chromadb.PersistentClient(path=DB_PATH)
    collection = chroma_client.get_or_create_collection(name='diegoclaw_knowledge')
    
    # Verificar o que já foi ingerido
    already_ingested = get_already_ingested(collection)
    
    # Heartbeat para validar conexão
    if not chroma_client.heartbeat():
        print("❌ ERRO: ChromaDB não está respondendo (heartbeat falhou)")
        sys.exit(1)
        
    print(f"\n📊 Verificando arquivos já processados...")
    if already_ingested:
        print(f"   Arquivos: {len(already_ingested)}")
    
    # Listar todos os PDFs
    pdf_files = glob.glob(os.path.join(KNOWLEDGE_DIR, '*.pdf'))
    pdf_files.sort()
    
    print(f"\n📚 Total de PDFs encontrados: {len(pdf_files)}")
    print("-" * 60)
    
    # Processar cada PDF
    total_chunks = 0
    processed = 0
    skipped = 0
    errors = 0
    
    for pdf_path in pdf_files:
        try:
            added = ingest_pdf(pdf_path, collection, openai_client, already_ingested)
            if added > 0:
                total_chunks += added
                processed += 1
            elif added == 0 and os.path.basename(pdf_path) in already_ingested:
                skipped += 1
        except Exception as e:
            filename = os.path.basename(pdf_path)
            print(f"\n  ❌ [ERRO FATAL] {filename}: {e}")
            errors += 1
    
    print("\n" + "=" * 60)
    print("📊 RESULTADO FINAL DA INGESTÃO:")
    print(f"✅ Concluído. Verifique o banco para total de chunks.")
    print("=" * 60)


if __name__ == '__main__':
    main()

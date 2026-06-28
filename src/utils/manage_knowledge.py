import os
import chromadb
from chromadb.config import Settings
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv
import hashlib
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

# Configurações
DB_PATH = os.path.join(os.environ.get('USERPROFILE', 'C:\\'), 'diegoclaw_db')
KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'knowledge')
COLLECTION_NAME = "diegoclaw_knowledge"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_embedding(text):
    text = text.replace("\n", " ")
    return client.embeddings.create(input=[text], model="text-embedding-3-small").data[0].embedding

def ingest_new_books():
    """Varre a pasta knowledge e ingere PDFs que ainda não estão no banco."""
    chroma_client = chromadb.PersistentClient(path=DB_PATH)
    collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
    
    # Pegar fontes já existentes
    existing_sources = set()
    results = collection.get(include=['metadatas'])
    if results['metadatas']:
        for meta in results['metadatas']:
            existing_sources.add(meta['source'])
            
    print(f"[*] Livros já indexados (fontes únicas no DB): {len(existing_sources)}")
    
    new_files = [f for f in os.listdir(KNOWLEDGE_DIR) if f.endswith('.pdf') and f not in existing_sources]
    
    if not new_files:
        print("[!] Nenhum livro novo encontrado para ingestão (ou todos já estão na base).")
        return

    print(f"[*] Encontrados {len(new_files)} novos livros. Iniciando processamento...")
    
    for filename in new_files:
        path = os.path.join(KNOWLEDGE_DIR, filename)
        print(f"[-] Processando: {filename}")
        
        try:
            with open(path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                full_text = ""
                for page in reader.pages:
                    full_text += page.extract_text() + "\n"
                
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len,
                    is_separator_regex=False,
                )
                paragraphs = text_splitter.split_text(full_text)
                # Opcionalmente, pode filtrar muito pequenos, mas o splitter lida bem.
                paragraphs = [p.strip() for p in paragraphs if len(p.strip()) > 50]
                
                print(f"    -> Gerando embeddings para {len(paragraphs)} trechos de {filename}...")
                
                for i, p in enumerate(paragraphs):
                    emb = get_embedding(p)
                    doc_id = hashlib.md5(f"{filename}_{i}".encode()).hexdigest()
                    collection.add(
                        ids=[doc_id],
                        embeddings=[emb],
                        documents=[p],
                        metadatas=[{"source": filename, "author": "DiegoClaw Ebooks", "type": "technical_book"}]
                    )
            print(f"[V] Sucesso: {filename}")
        except Exception as e:
            print(f"[X] Erro em {filename}: {str(e)}")

def status_db():
    try:
        from chromadb import HttpClient
        chroma_client = HttpClient(host='localhost', port=8002)
    except:
        chroma_client = chromadb.PersistentClient(path=DB_PATH)
    collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
    count = collection.count()
    
    results = collection.get(include=['metadatas'])
    sources = set(m['source'] for m in results['metadatas']) if results['metadatas'] else set()
    
    print("\n=== Stats do DiegoClaw ===")
    print(f"Total de trechos (chunks): {count}")
    print(f"Total de livros exclusivos: {len(sources)}")
    print("---------------------------\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--status":
        show_status()
    else:
        ingest_new_books()
        show_status()

import chromadb
import sys
import json
import os
from openai import OpenAI

# Configuração
# Usar Docker HttpClient
from chromadb import HttpClient

# Desativar overrides problemáticos do chromadb telemetry
import os
os.environ['CHROMA_TELEMETRY'] = 'false'

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
client = HttpClient(host='localhost', port=8002)
collection = client.get_or_create_collection(name="diegoclaw_knowledge")

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

import hashlib

# Cache de Embeddings
CACHE_PATH = os.path.join(DB_PATH, 'embedding_cache.json')

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_PATH, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar cache: {e}", file=sys.stderr)

def get_query_hash(query):
    return hashlib.md5(query.lower().strip().encode('utf-8')).hexdigest()

def search(query, n_results=5):
    try:
        cache = load_cache()
        query_hash = get_query_hash(query)
        
        if query_hash in cache:
            embedding = cache[query_hash]
        else:
            # Gerar embedding via OpenAI
            response = openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=query
            )
            embedding = response.data[0].embedding
            # Salvar no cache
            cache[query_hash] = embedding
            save_cache(cache)
        
        results = collection.query(
            query_embeddings=[embedding],
            n_results=n_results
        )
        
        output = []
        if results['documents'] and len(results['documents']) > 0:
            for i in range(len(results['documents'][0])):
                output.append({
                    "text": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                })
        
        return output
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)
    
    query = sys.argv[1]
    results = search(query)
    print(json.dumps(results))

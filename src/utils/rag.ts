import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ChromaClient } from 'chromadb';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COLLECTION_NAME = 'diegoclaw_knowledge';
const CHROMA_HOST = process.env.CHROMA_HOST ?? 'localhost';
const CHROMA_PORT = parseInt(process.env.CHROMA_PORT ?? '8000', 10);

/**
 * Nível de cobertura RAG — determina como o AgentController injeta o contexto.
 *
 * - full:        >= 5 evidências — base cobre bem o tema
 * - partial:     1-4 evidências — cobertura parcial, bot deve ser transparente
 * - blind_spot:  0 evidências   — tema fora da biblioteca atual
 */
export type RagCoverage = 'full' | 'partial' | 'blind_spot';

export interface RagResult {
  text: string;
  metadata: Record<string, any>;
}

export interface RagSearchResult {
  results: RagResult[];
  coverage: RagCoverage;
}

// Cliente HTTP — conecta ao servidor ChromaDB (start_rag_server.bat)
let chromaClient: ChromaClient | null = null;
let collectionCache: any = null;

function getClient(): ChromaClient {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ host: CHROMA_HOST, port: CHROMA_PORT });
  }
  return chromaClient!;
}

async function isChromaAvailable(): Promise<boolean> {
  try {
    await getClient().heartbeat();
    return true;
  } catch {
    return false;
  }
}

async function getCollection(): Promise<any> {
  if (collectionCache) return collectionCache;
  try {
    collectionCache = await getClient().getOrCreateCollection({ name: COLLECTION_NAME });
    return collectionCache;
  } catch {
    collectionCache = null;
    return null;
  }
}

function computeCoverage(count: number): RagCoverage {
  if (count === 0) return 'blind_spot';
  if (count < 5) return 'partial';
  return 'full';
}

/**
 * Busca conhecimento no ChromaDB usando RAG-Fusion.
 *
 * Retorna os resultados E o nível de cobertura para que o AgentController
 * adapte o comportamento do bot:
 *   - full:       injeta evidências normalmente (modo expert)
 *   - partial:    injeta + instrui bot a ser transparente sobre a lacuna
 *   - blind_spot: bot admite que o tema está fora da biblioteca e registra o gap
 *
 * Se o servidor estiver offline → retorna blind_spot silenciosamente.
 */
export async function searchKnowledge(query: string, limit: number = 8): Promise<RagSearchResult> {
  const unavailable: RagSearchResult = { results: [], coverage: 'blind_spot' };

  const available = await isChromaAvailable();
  if (!available) {
    console.warn('[RAG] Servidor offline — modo LLM puro. Execute: start_rag_server.bat');
    return unavailable;
  }

  try {
    const collection = await getCollection();
    if (!collection) return unavailable;

    const count = await collection.count();
    if (count === 0) {
      console.warn('[RAG] Base vazia. Execute: python ingest.py');
      return unavailable;
    }

    // 1. Query Expansion (RAG-Fusion)
    const expansionRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Gere 3 variações desta pergunta para busca vetorial ' +
            '(técnica, conceitual, prática). Retorne apenas as 3 variações, uma por linha.',
        },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
    });

    const queries = (expansionRes.choices[0]?.message?.content ?? '')
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    queries.push(query);

    // 2. Embeddings em paralelo
    const embeddingsRes = await Promise.all(
      queries.map((q) => openai.embeddings.create({ model: 'text-embedding-3-small', input: q }))
    );
    const embeddings = embeddingsRes.map((res) => res.data[0].embedding);

    // 3. Busca multi-query
    const searchResults = await Promise.all(
      embeddings.map((emb) =>
        collection.query({ queryEmbeddings: [emb], nResults: 5 })
      )
    );

    // 4. Deduplicação por ID
    const documentMap = new Map<string, RagResult>();
    searchResults.forEach((result) => {
      if (result.documents?.[0]?.length > 0) {
        const docs = result.documents[0] as string[];
        const metas = result.metadatas?.[0] ?? [];
        docs.forEach((doc: string, i: number) => {
          const id = result.ids[0][i];
          if (!documentMap.has(id)) {
            documentMap.set(id, {
              text: doc,
              metadata: (metas[i] as Record<string, any>) ?? {},
            });
          }
        });
      }
    });

    const results = Array.from(documentMap.values()).slice(0, limit);
    const coverage = computeCoverage(results.length);

    console.log(`[RAG-Fusion] ${results.length} trechos | cobertura: ${coverage}`);
    return { results, coverage };
  } catch (error: any) {
    console.error('[RAG] Erro na busca:', error.message);
    collectionCache = null;
    return unavailable;
  }
}

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import dotenv from 'dotenv';
import OpenAI from 'openai';
const { ChromaClient } = require('chromadb');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new ChromaClient();

async function getEmbeddings(texts: string[]) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map(item => item.embedding);
}

async function ingestPDF(filePath: string, area: string) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[Ingest] Arquivo não encontrado: ${filePath}`);
      return;
    }
    const dataBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    console.log(`[Ingest] Lendo: ${fileName}...`);
    
    const data = await pdf(dataBuffer);
    console.log(`[Ingest] Extraído: ${data.numpages} páginas de ${fileName}.`);

    console.log(`[Ingest] Conectando ao ChromaDB...`);
    const collection = await client.getOrCreateCollection({
      name: "diegoclaw_knowledge"
    });

    // Improved chunking logic
    const rawChunks = data.text.split(/\n\s*\n/);
    const chunks = rawChunks.map(c => c.trim()).filter(c => c.length > 100); // Filter chunks shorter than 100 chars
    console.log(`[Ingest] Criando ${chunks.length} chunks para: ${fileName}...`);

    const batchSize = 20; 
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batchTexts = chunks.slice(i, i + batchSize);
        const batchIds = batchTexts.map((_, idx) => `${fileName}_${i + idx}`);
        const batchMetadatas = batchTexts.map((_, idx) => ({ 
            source: fileName, 
            author: area, // Using 'area' as author for now
            type: 'technical_book',
            topic: 'AI/Engineering',
            chunk_index: i + idx 
        }));

        console.log(`[Ingest] Gerando embeddings para o batch ${i / batchSize + 1}...`);
        const embeddings = await getEmbeddings(batchTexts);

        await collection.add({
            ids: batchIds,
            metadatas: batchMetadatas,
            documents: batchTexts,
            embeddings: embeddings
        });
        console.log(`[Ingest] Batched: ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`);
    }
    console.log(`[Ingest] SUCESSO: ${fileName} ingerido com embeddings manuais.`);

  } catch (error: any) {
    console.error(`[Ingest] ERRO em ${path.basename(filePath)}:`, error.message);
  }
}

async function main() {
  const knowledgeDir = path.join(__dirname, '../../knowledge');
  const pilotBooks = [
    { name: 'ADOCAO_DE_LLM_ENTERPRISE.pdf', area: 'IA' },
    { name: '2026-02-25 - RAG.pdf', area: 'IA/RAG' }
  ];

  for (const book of pilotBooks) {
    const fullPath = path.join(knowledgeDir, book.name);
    await ingestPDF(fullPath, book.area);
  }
}

main().catch(err => {
    console.error("[Main] Erro fatal:", err.message);
    process.exit(1);
});

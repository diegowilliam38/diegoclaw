const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { ChromaClient } = require('chromadb');
const crypto = require('crypto');

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Modo embedded — sem servidor externo
const CHROMA_PATH = path.join(__dirname, '../../chroma_db');
const COLLECTION_NAME = 'diegoclaw_knowledge';
const KNOWLEDGE_DIR = path.join(__dirname, '../../knowledge');

const client = new ChromaClient({ path: CHROMA_PATH });

async function getEmbeddings(texts) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
    });
    return response.data.map(item => item.embedding);
}

async function manageKnowledge() {
    const collection = await client.getOrCreateCollection({ name: COLLECTION_NAME });

    // Pegar fontes já indexadas
    let existingSources = new Set();
    try {
        const results = await collection.get({ include: ['metadatas'] });
        if (results.metadatas && results.metadatas.length > 0) {
            for (const meta of results.metadatas) {
                if (meta && meta.source) existingSources.add(meta.source);
            }
        }
    } catch (e) {
        // Coleção nova — sem dados ainda
    }

    const count = await collection.count();
    console.log(`[*] Chunks já indexados: ${count}`);
    console.log(`[*] Fontes já indexadas: ${existingSources.size}`);

    const files = fs.readdirSync(KNOWLEDGE_DIR);
    const pdfFiles = files.filter(f => f.endsWith('.pdf') || f.endsWith('.txt'));
    const newFiles = pdfFiles.filter(f => !existingSources.has(f));

    if (newFiles.length === 0) {
        console.log("\n[✓] Nenhum arquivo novo encontrado. Base já está atualizada!");
        return;
    }

    console.log(`\n[*] ${newFiles.length} arquivo(s) novo(s) para ingerir de ${pdfFiles.length} total.`);
    console.log("─".repeat(60));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < newFiles.length; i++) {
        const filename = newFiles[i];
        const progress = `[${i + 1}/${newFiles.length}]`;
        console.log(`\n${progress} Processando: ${filename}`);
        const filePath = path.join(KNOWLEDGE_DIR, filename);

        try {
            let text = '';

            if (filename.endsWith('.pdf')) {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                text = data.text;
            } else if (filename.endsWith('.txt')) {
                text = fs.readFileSync(filePath, 'utf-8');
            }

            // Chunking por parágrafo + filtro de tamanho mínimo
            const rawChunks = text.split(/\n\s*\n/);
            const chunks = rawChunks
                .map(c => c.replace(/\s+/g, ' ').trim())
                .filter(c => c.length > 150);

            if (chunks.length === 0) {
                console.log(`    [!] Nenhum trecho útil extraído. Pulando.`);
                continue;
            }

            console.log(`    -> ${chunks.length} trechos para indexar...`);

            // Ingestão em batches de 25 (limite da API OpenAI)
            const batchSize = 25;
            for (let j = 0; j < chunks.length; j += batchSize) {
                const batchTexts = chunks.slice(j, j + batchSize);
                const batchIds = batchTexts.map((_, idx) =>
                    crypto.createHash('md5').update(`${filename}_${j + idx}`).digest('hex')
                );
                const batchMetadatas = batchTexts.map(() => ({
                    source: filename,
                    type: filename.endsWith('.txt') ? 'note' : 'technical_book'
                }));

                const embeddings = await getEmbeddings(batchTexts);

                await collection.add({
                    ids: batchIds,
                    metadatas: batchMetadatas,
                    documents: batchTexts,
                    embeddings: embeddings
                });

                const pct = Math.round(((j + batchTexts.length) / chunks.length) * 100);
                process.stdout.write(`\r    -> Progresso: ${pct}% (${Math.min(j + batchSize, chunks.length)}/${chunks.length} trechos)`);
            }

            console.log(`\n    [✓] Concluído: ${filename}`);
            successCount++;
        } catch (err) {
            console.error(`\n    [✗] Erro em ${filename}:`, err.message);
            errorCount++;
        }
    }

    console.log("\n" + "═".repeat(60));
    console.log(`[✓] Ingestão finalizada! Sucesso: ${successCount} | Erros: ${errorCount}`);
}

async function showStatus() {
    const collection = await client.getOrCreateCollection({ name: COLLECTION_NAME });
    const count = await collection.count();

    let sources = new Set();
    const results = await collection.get({ include: ['metadatas'], limit: 999999 });
    if (results.metadatas) {
        for (const meta of results.metadatas) {
            if (meta && meta.source) sources.add(meta.source);
        }
    }

    console.log("\n╔══════════════════════════════╗");
    console.log("║   DiegoClaw — RAG Status     ║");
    console.log("╠══════════════════════════════╣");
    console.log(`║  Total de chunks: ${String(count).padEnd(10)} ║`);
    console.log(`║  Obras indexadas: ${String(sources.size).padEnd(10)} ║`);
    console.log("╠══════════════════════════════╣");
    if (sources.size > 0) {
        console.log("║  Fontes:                     ║");
        for (const s of sources) {
            const name = String(s).substring(0, 28);
            console.log(`║  • ${name.padEnd(26)} ║`);
        }
    }
    console.log("╚══════════════════════════════╝\n");
}

async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--status')) {
        await showStatus();
    } else {
        await manageKnowledge();
        await showStatus();
    }
}

main().catch(err => {
    console.error("\n[FATAL] Erro ao executar:", err.message);
    process.exit(1);
});

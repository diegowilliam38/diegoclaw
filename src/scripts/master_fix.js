const { spawn } = require('child_process');
const { ChromaClient } = require('chromadb');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function waitReady(url, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            await axios.get(url);
            return true;
        } catch (e) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return false;
}

async function run() {
    console.log('[Mestre] Iniciando ChromaDB via caminho absoluto com logs...');
    const chromaPath = 'C:\\Users\\Diego William\\AppData\\Roaming\\Python\\Python313\\Scripts\\chroma.exe';
    
    const out = fs.openSync('./chroma_master_out.log', 'a');
    const err = fs.openSync('./chroma_master_err.log', 'a');
    
    const chroma = spawn(chromaPath, ['run', '--path', './chroma_db', '--port', '8000'], {
        detached: true,
        stdio: ['ignore', out, err]
    });
    chroma.unref();

    const ready = await waitReady('http://localhost:8000/api/v1/heartbeat', 60000);
    if (!ready) {
        console.error('[Mestre] Erro: ChromaDB não subiu em 30s.');
        process.exit(1);
    }
    console.log('[Mestre] ChromaDB pronto!');

    // Agora rodar o ingest.ts via ts-node ou similar
    console.log('[Mestre] Iniciando Ingestão...');
    const ingest = spawn('npx', ['ts-node', 'src/scripts/ingest.ts'], { stdio: 'inherit' });
    
    ingest.on('close', (code) => {
        console.log(`[Mestre] Ingestão finalizada com código ${code}`);
        process.exit(code);
    });
}

run();

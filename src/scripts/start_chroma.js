const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const logFile = path.join(__dirname, '../../chroma_exec.log');
const out = fs.openSync(logFile, 'a');

console.log('[Chroma] Iniciando servidor...');

const pythonPath = 'C:\\Python313\\python.exe';
const child = spawn(pythonPath, [
    '-m', 'chromadb.cli.cli', 'run',
    '--path', path.join(__dirname, '../../chroma_db'),
    '--host', '127.0.0.1',
    '--port', '8000'
], {
    detached: true,
    stdio: ['ignore', out, out]
});

child.unref();

console.log(`[Chroma] PID: ${child.pid}. Verificando pulso em 127.0.0.1:8000...`);

let attempts = 0;
const checkHeartbeat = () => {
    http.get('http://127.0.0.1:8000/api/v1/heartbeat', (res) => {
        if (res.statusCode === 200) {
            console.log('[Chroma] CONECTADO E PRONTO!');
            process.exit(0);
        }
    }).on('error', () => {
        attempts++;
        if (attempts > 30) {
            console.error('[Chroma] Falha ao iniciar após 30s. Verifique chroma_exec.log');
            process.exit(1);
        }
        setTimeout(checkHeartbeat, 1000);
    });
};

checkHeartbeat();

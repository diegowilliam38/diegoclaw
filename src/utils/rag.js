const { execSync } = require('child_process');
const path = require('path');

async function searchKnowledge(query, nResults = 5) {
  try {
    const pythonScript = path.join(__dirname, 'search_rag.py');
    const command = `python "${pythonScript}" "${query.replace(/"/g, '\\"')}"`;
    
    // Passamos a chave via ambiente para o sub-processo
    const result = execSync(command, { 
      env: { ...process.env },
      encoding: 'utf-8' 
    });

    const parsed = JSON.parse(result);
    if (parsed.error) throw new Error(parsed.error);

    return parsed.map(item => ({
      text: item.text,
      metadata: item.metadata
    }));
  } catch (error) {
    console.error("[RAG] Erro na busca (Bridge):", error.message);
    return [];
  }
}

module.exports = { searchKnowledge };

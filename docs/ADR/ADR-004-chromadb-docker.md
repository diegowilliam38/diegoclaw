# ADR-004: Migração de ChromaDB PersistentClient para Docker HttpClient

**Status:** Aceito
**Data:** 2026-06-27
**Autor:** @architect / @dev

## Contexto e Problema
O DiegoClaw foi inicialmente arquitetado (ADR-001) para utilizar o `chromadb.PersistentClient()` para armazenar os vetores localmente via SQLite no Windows, dispensando infraestrutura externa. 
Entretanto, durante a fase de ingestão massiva de 55 livros técnicos na versão 0.5.0 do ChromaDB, deparamo-nos com falhas silenciosas críticas (Exit Code 1 no Python, sem exceções ou log) decorrentes de *segfaults* na biblioteca C++ associada ao SQLite do Windows. Múltiplas corrupções da pasta `chroma_db` e processos fantasmas ocorreram, inviabilizando o uso seguro de `PersistentClient`.

## Alternativas Consideradas
1. **Fazer downgrade do ChromaDB:** Poderia causar perdas de features e incompatibilidades com `text-embedding-3`.
2. **Utilizar Docker (chromadb/chroma):** A fundação do ChromaDB mantém imagens Docker estáveis para Linux, que encapsulam perfeitamente o ambiente C++ e o SQLite sem sofrer com peculiaridades de file-locking do host Windows. O DiegoClaw tem suporte a DevOps (skill `devops`) e o ambiente local já conta com Docker Desktop.

## Decisão
Abandonaremos o uso de `chromadb.PersistentClient` nativo no host Windows. Em vez disso, o banco vetorial será executado via **Docker** (`chromadb/chroma`), exposto na porta 8000, com os dados persistidos de forma segura no host usando volumes montados. Os scripts internos (`ingest.py` e bot) utilizarão `chromadb.HttpClient(host='localhost', port=8000)`.

## Consequências
- **Positivo:** Fim das corrupções silenciosas no Windows. Maior estabilidade e observabilidade do servidor RAG.
- **Negativo:** O usuário deve obrigatoriamente abrir o Docker Desktop antes de inicializar a aplicação (embora isso já fizesse parte da rotina de outros projetos do AIOS-WORKSPACE).

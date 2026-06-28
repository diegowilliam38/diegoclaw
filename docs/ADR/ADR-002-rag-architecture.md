# ADR-002: Advanced RAG Architecture (Second Brain)

**Date:** 2026-03-17  
**Status:** Accepted  
**Author:** DiegoClaw Squad (Antigravity)  
**Reviewed by:** Diego William  

---

## Context

O DiegoClaw deve atuar como um "Segundo Cérebro", integrando uma biblioteca de 37 ebooks técnicos (O'Reilly, Sandeco, etc.). A recuperação de informação (RAG) convencional por chunks de tamanho fixo frequentemente perde o contexto semântico e a hierarquia dos livros (capítulos, seções, notas de rodapé).

---

## Decision

Implementar uma arquitetura de **Advanced RAG (Modular RAG)** com os seguintes pilares:

1.  **Semantic Chunking**: Em vez de divisões por caracteres fixos, os chunks serão divididos respeitando a estrutura do PDF (parágrafos, títulos de seção) ou via `SemanticChunker` (baseado em variações de embedding).
2.  **Hybrid Search (Dense + Sparse)**: 
    -   **Dense**: Embeddings via OpenAI `text-embedding-3-small` (custo-eficiente).
    -   **Sparse**: BM25 ou busca por keywords para termos técnicos específicos (ex: nomes de bibliotecas, siglas).
3.  **Metadata-Rich Indexing**: Cada chunk deve conter metadados obrigatórios: `book_title`, `author`, `page_number`, `category` (IA, Data, Dev) e `chapter_title`.
4.  **Parent-Document Retrieval**: O banco vetorial indexará "proposições" ou resumos curtos que apontam para o chunk de contexto completo, melhorando a precisão da busca sem perder a profundidade na resposta.
5.  **Re-ranking (Cross-Encoder)**: Após a busca inicial, os top 10 resultados serão re-avaliados por um modelo de re-ranking (ex: Cohere ou local via ONNX) para garantir que os chunks mais relevantes para a pergunta do usuário estejam no topo.

---

## Alternatives Considered

### Fixed-Size Chunking (rejeitado)
- **Pro**: Simples de implementar.
- **Con**: Perde contexto em diagramas e listas técnicas, resultando em respostas incompletas.

### Knowledge Graphs (adiado)
- **Pro**: Excelente para conexões complexas.
- **Con**: Alta complexidade de implementação inicial para o MVP; será reavaliado na Fase 5.

---

## Consequences

**Positivo:**
- Respostas muito mais precisas e contextualizadas.
- O DiegoClaw poderá citar a fonte exata (Livro e Página).
- Melhor manuseio de terminologia técnica específica através da busca híbrida.

**Negativo/Trade-offs:**
- Processamento inicial (ingestão) mais lento e custoso computacionalmente.
- Requer lógica de "Pre-processing" mais robusta para extração de PDF.

---

## Rule for Future Projects

> Toda integração de biblioteca técnica (Ebooks/Artigos) DEVE usar metadados de página/capítulo para possibilitar citações.  
> Evitar `chunk_size` fixo puro; dar preferência a limites semânticos.

---

## Related Documents
- `specs/PRD.md` (Update v1.1)
- `_CORE_SKILLS/docs/ADR/agents-ia/ADR-004-rag-documentos-juridicos.md` (Referência de separadores semânticos)

# Story: 002-mcp-agentic-workflows

## 1. Visão Geral
**Como** usuário do ecossistema AIOS (Diego William),
**Eu quero** que o bot DiegoClaw seja capaz de executar ações no mundo real (Notion, n8n),
**Para que** ele atue como um verdadeiro Agente e não apenas como um motor passivo de buscas.

## 2. Contexto de Negócio
Atualmente, o DiegoClaw extrai conhecimento de 55 livros técnicos via RAG (ChromaDB) e oferece respostas em "Expert Mode". O sistema já inicia conexões MCP (Model Context Protocol) para Notion e n8n em background, porém o LLM carece do "know-how" estruturado de como essas integrações devem ser acionadas.

## 3. Critérios de Aceite
- [x] O LLM (GPT-4o-mini) deve receber um contexto claro de quais ferramentas MCP estão à sua disposição.
- [x] O LLM deve saber que, para operações no Notion, ele primeiro deve utilizar a ferramenta de busca de Data Sources (`mcp_API_query_data_source`) antes de criar páginas (`mcp_API_post_page`).
- [x] O LLM deve seguir as regras de resiliência e segurança ao falhar numa requisição de ferramenta.
- [x] Nenhuma alteração no core do TypeScript (`AgentLoop` ou `ToolFactory`) deverá ser necessária, visto que os provedores já suportam function calling.

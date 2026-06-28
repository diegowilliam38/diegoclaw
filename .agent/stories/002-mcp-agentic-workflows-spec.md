# Spec: 002-mcp-agentic-workflows

## 1. Responsáveis
- **Owner**: `@architect` e `@prompt-engineer`
- **Revisão Técnica**: `@qa`
- **Camada**: Prompt Engineering & Integrations

## 2. Objetivo Técnico
Injetar diretrizes de chamada de função (Function Calling) no prompt mestre da skill `automations`, ensinando ao modelo cognitivo do DiegoClaw (ReAct AgentLoop) os padrões exigidos pelas APIs expostas pelos servidores MCP locais.

## 3. Implementação Proposta
A alteração ocorre puramente no nível semântico (Markdown), sem mutação no TypeScript.
**Alvo**: `.agents/skills/automations/SKILL.md`

### 3.1. Tratamento Notion MCP
- A API do Notion MCP injeta dinamicamente as tools no `ToolRegistry` (ex: `mcp_API_retrieve_a_page`, `mcp_API_query_data_source`, `mcp_API_post_page`).
- O LLM precisa ser instruído a:
  1. Identificar se o usuário pediu para buscar ou criar.
  2. Nunca tentar adivinhar um `database_id` ou `page_id`. Se faltar, usar a ferramenta de busca (query data source) primeiro.
  3. Preencher os properties de forma estrita baseando-se no schema recuperado.

### 3.2. Tratamento n8n MCP
- O n8n expõe workflows ativados para chat/agentes.
- O LLM será instruído a sempre descrever a ação que vai executar antes de chamar a tool.

## 4. Testabilidade e Rollback
**Testabilidade**: Pedir ao bot para "Criar uma tarefa no meu Notion". Observar no AgentLoop os logs de `[ACTION] Tool chamada: mcp_API_...`.
**Rollback**: Reverter as adições no arquivo `SKILL.md`. Não há migrations de DB aplicáveis.

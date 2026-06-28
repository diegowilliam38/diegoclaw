# DiegoClaw — Backlog de Capacidades Futuras (Auto-aprendizado Avançado)

> **Registrado em:** 2026-05-13  
> **Contexto:** Ao implementar os 3 mecanismos viáveis de auto-awareness de conhecimento,  
> identificamos capacidades que exigem infraestrutura adicional (acesso à internet) e ficam  
> registradas aqui para a próxima versão major do DiegoClaw.

---

## 🔮 Capacidades Futuras — v3.0 (Auto-aprendizado Avançado)

### F-01 — Detecção Autônoma de Novas Edições / Versões

**O que é:** O bot verificaria automaticamente se uma obra já indexada tem nova edição disponível.  
**Exemplo:** "O Spark: O Guia Definitivo foi indexado em 2026-05-13. Existe a 3ª edição desde então?"  

**O que precisa:**
- Tool de web search (Brave Search API ou Tavily) registrada no ToolRegistry
- Lógica de comparação: versão indexada vs. versão atual na O'Reilly
- Schedule periódico (ex: verificar mensalmente via n8n ou cron)

**Dependência:** `BRAVE_SEARCH_API_KEY` no .env + tool `WebSearchTool.ts`

---

### F-02 — Recomendação Autônoma de Obras Complementares

**O que é:** Baseado no padrão de gaps registrados em `knowledge/GAPS.md`, o bot sugere  
proativamente obras que cobririam os gaps mais frequentes — buscando título, autor e link oficial.

**Exemplo de output proativo:**
```
Diego, nos últimos 15 dias identifiquei estes gaps frequentes na sua biblioteca:
1. Terraform / IaC (3x pedido) → "Terraform: Up & Running" - Brikman (O'Reilly)
2. LangSmith / Observabilidade (2x) → "Building LLM-Powered Apps" capítulo 8
Quer que eu adicione algum desses à fila de ingestão?
```

**O que precisa:**
- Tool `WebSearchTool.ts` (para buscar autor/título/link)
- Análise periódica do `GAPS.md` (script Python ou workflow n8n)
- Canal de notificação proativa (Telegram push sem user trigger)

**Dependência:** F-01 + schedule trigger

---

### F-03 — Verificação de Desatualização por Changelog

**O que é:** Para tópicos marcados como `fast_evolving: true` nos metadados, o bot verificaria  
na web se houve breaking changes ou major releases desde a data de ingestão.

**Exemplo:** "LangChain foi indexado em 2026-05-13. Verificando... v0.3 lançado em 2026-07 com mudanças no LCEL."

**O que precisa:**
- Tool `WebSearchTool.ts` + parsing de changelogs (GitHub releases, PyPI, npm)
- Mapeamento: filename → repositório oficial (ex: "langchain" → `github.com/langchain-ai/langchain`)
- Atualização do metadado `last_checked: "2026-06-01"` no ChromaDB

**Dependência:** F-01 + arquivo de mapeamento `knowledge/source_map.yaml`

---

## 📋 Como ativar quando for o momento

```bash
# 1. Instalar dependência de web search
npm install brave-search-sdk  # ou tavily-client

# 2. Criar WebSearchTool.ts em src/tools/
# 3. Registrar no ToolFactory.ts
# 4. Adicionar BRAVE_SEARCH_API_KEY no .env
# 5. Criar source_map.yaml em knowledge/ (mapeamento obra → repositório)
```

---

## ✅ Já implementado (v2.0 — 2026-05-13)

| Mecanismo | Status |
|---|---|
| Gap Detection (blind_spot / partial / full) | ✅ AgentController |
| Knowledge Currency Flag (ingestion_date + fast_evolving) | ✅ ingest.py + rag.ts |
| Knowledge Gap Register (GAPS.md via KnowledgeGapTool) | ✅ tools/KnowledgeGapTool.ts |

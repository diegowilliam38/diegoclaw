# ADR-001: Stack Inicial — TypeScript + Grammy + SQLite + OpenAI

**Date:** 2026-03-17  
**Status:** Accepted  
**Author:** DiegoClaw Squad (Antigravity)  
**Reviewed by:** Diego William  

---

## Context

O DiegoClaw é um agente de IA pessoal local para Diego William, controlado via Telegram. A decisão de stack inicial foi tomada com base em:

1. Análise do SandeClaw de Sandeco (vídeo: "Tchau OpenClaw! Criei meu agente pessoal usando o Antigravity do zero")
2. Stack já validada em produção no próprio SandeClaw
3. Compatibilidade com o ambiente Windows local e preferências do Tech Lead

---

## Decision

Adotar a seguinte stack para o DiegoClaw MVP:

| Camada | Decisão |
|--------|---------|
| Linguagem | TypeScript / Node.js v20 LTS |
| Bot Framework | `grammy` |
| Banco de Dados | SQLite via `better-sqlite3` |
| LLM Principal | OpenAI GPT-4o-mini |
| LLM Fallback | DeepSeek (via API compatível OpenAI) |
| Paradigma | OOP com Design Patterns (Facade, Factory, Repository, Singleton, Strategy, Registry) |
| Agent Pattern | ReAct (Thought → Action → Observation → Answer) |

---

## Alternatives Considered

### LLM: Gemini 2.0 Flash (rejeitado)
- **Pro:** API gratuita, excelente em português
- **Con:** Tech Lead tem $10.16 na OpenAI e prefere usar essa conta; GPT-4o-mini tem suporte superior a tool calls estruturados

### LLM: Claude Haiku (rejeitado)
- **Pro:** Excelente raciocínio
- **Con:** Tech Lead não tem conta/créditos Anthropic disponíveis

### Bot: python-telegram-bot (rejeitado)
- **Pro:** Ecosystem Python rico (LangGraph, LangChain)
- **Con:** SandeClaw usa Node.js/TypeScript; evitar mudança desnecessária de stack; Grammy é moderno e bem mantido

### DB: PostgreSQL / Supabase (rejeitado)
- **Pro:** Escalável
- **Con:** Agente pessoal de 1 usuário; overhead desnecessário; SQLite local é suficiente e zero infra

---

## Consequences

**Positivo:**
- Stack validada em produção real (SandeClaw)
- GPT-4o-mini tem excelente suporte a function calling (essencial para ReAct)
- SQLite é zero config, backup é copiar 1 arquivo
- Grammy tem hot-reload nativo e API moderna

**Negativo/Trade-offs:**
- $10.16 de crédito OpenAI tem limite (porém suficiente para meses de uso pessoal)
- Node.js/TypeScript tem overhead de tipagem vs Python puro

---

## Rule for Future Projects

> Agentes pessoais locais de single-user: preferir SQLite (serverless) sobre Postgres.  
> Para o LLM, usar o provider onde o Tech Lead já tem crédito/conta ativa.  
> Stack SandeClaw (Grammy + TypeScript + ReAct) é referência validada para esse tipo de projeto.

---

## Related Documents

- `ARCHITECTURE.md`
- `specs/PRD.md`
- Inspiração: [SandeClaw Specs](https://github.com/diegowilliam38/sandeco/tree/main/SandeClaw/specs)

# Spec: PRD — DiegoClaw Core

**Versão:** 2.0  
**Status:** Aprovada  
**Autor:** DiegoClaw Squad (Antigravity)  
**Data:** 2026-05-13 (atualizado de 2026-03-17)  
**Reviewer:** Diego William  
**Changelog:** v2.0 — RAG Expert Mode, 55 obras, 8 skills, cross-domain routing  

---

## 1. Resumo

O **DiegoClaw** é o segundo cérebro de Diego William — um agente pessoal de IA que opera como **consultor sênior multidisciplinar**, tendo internalizado 55 obras técnicas de referência (O'Reilly, Sandeco). Ele não recupera e repete texto — ele sintetiza conhecimento e aplica ao contexto específico de Diego, respondendo como os próprios experts das áreas responderiam.

---

## 2. Contexto e Motivação

**Problema:**  
Agentes hospedados em cloud requerem exposição de dados privados, custos recorrentes altos e falta de controle total sobre skills e comportamentos customizados. Diego William precisa de um assistente que esteja sempre disponível, entenda seu contexto de trabalho (dev IA, content creator, eventos) e opere sem fricção.

**Inspiração:**  
O SandeClaw de Sandeco (vídeo: "Tchau OpenClaw! Criei meu agente pessoal usando o Antigravity do zero") demonstrou que é possível criar um agente pessoal robusto com TypeScript, Grammy e SQLite. O DiegoClaw é a versão personalizada de Diego William seguindo o mesmo conceito.

**Por que agora:**  
GPT-4o-mini tem excelente custo/benefício ($0.15/1M tokens input), Diego William tem $10.16 de crédito OpenAI, e a estrutura AIOS-WORKSPACE com pipeline Squad permite criar isso de forma documentada e escalável.

---

## 3. Goals (Objetivos)

- [ ] **G-01:** Operar recebendo e respondendo requisições pelo Telegram via `grammy` com polling persistente.
- [ ] **G-02:** Usar OpenAI GPT-4o-mini como LLM principal com fallback para DeepSeek.
- [ ] **G-03:** Reter contexto por múltiplos turnos com SQLite via padrão Repository.
- [ ] **G-04:** Respeitar whitelist estrita de usuário via `TELEGRAM_ALLOWED_USER_IDS`.
- [ ] **G-05:** Suportar skills hot-reload a partir da pasta `.agents/skills/` sem restart.
- [ ] **G-06:** Implementar ReAct loop (Thought → Action → Observation → Answer) com limite de iterações.
- [x] **G-07:** Internalizar conhecimento técnico de 55 obras via RAG Expert Mode — síntese consultiva, não recuperação literal.
- [x] **G-08:** Atuar via 8 skills especializadas com personas de expert por domínio e roteamento cross-domain automático.

**Métricas de sucesso:**

| Métrica | Target | Prazo |
|---------|--------|-------|
| Uptime local após `npm run dev` | 99% (sem crash automático) | MVP |
| Troca de skills via hot-reload | ≤ 1 segundo | MVP |
| Taxa de sucesso do ReAct loop | ≥ 95% resolvem antes do MAX_ITERATIONS | Produção |
| Latência de resposta (excluindo LLM) | < 500ms | MVP |

---

## 4. Non-Goals (Fora do Escopo)

- **NG-01:** Interface Web (React/Vue/HTML). Interface é exclusivamente o Telegram.
- **NG-02:** Multi-usuário / SaaS. Sistema para 1 usuário (Diego William) com whitelist estrita.
- **NG-03:** Banco de dados cloud (PostgreSQL/Supabase). Foco em SQLite local mínimo.
- **NG-04:** Deploy em cloud/VPS nesta fase. Execução local desktop apenas.

---

## 5. Usuários e Personas

**Usuário primário:** Diego William (proprietário), acessando via Telegram mobile ou desktop.

**Jornada atual (sem DiegoClaw):**  
Acessa ChatGPT, Gemini e outras ferramentas separadamente via browser. Sem memória de contexto entre sessões. Precisa reexplicar seu contexto em cada nova conversa.

**Jornada futura (com DiegoClaw):**  
Abre o Telegram, manda uma mensagem direto. O DiegoClaw já sabe quem ele é, seu contexto de trabalho, carrega a skill certa automaticamente e responde de forma orgânica com ações reais (criar arquivos, buscar info, etc.).

---

## 6. Requisitos Funcionais

### 6.1 Requisitos Principais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Loop de polling persistente via Grammy | Must | `npm run dev` inicia e intercepta mensagens sem fechar |
| RF-02 | Validação whitelist em todas as mensagens | Must | Usuário não cadastrado recebe ignore silencioso, sem log de conteúdo |
| RF-03 | LLM via `ProviderFactory` intercambiável | Must | Trocar `openai` por `deepseek` no `.env` alterna provider corretamente |
| RF-04 | Memória multi-turno com SQLite | Must | Bot lembra contexto de conversas anteriores ao reiniciar |
| RF-05 | Skills hot-reload de `.agents/skills/` | Must | Adicionar nova pasta de skill funciona sem restart |
| RF-06 | ReAct loop com limite de iterações | Must | Nunca ultrapassa `MAX_ITERATIONS`; encerra com mensagem de fallback |

### 6.2 Fluxo Principal (Happy Path)

1. Diego envia "Crie uma spec PRD para o projeto X" no Telegram.
2. `TelegramInputHandler` recebe, valida whitelist (OK).
3. `AgentController` aciona `SkillLoader` → lê `.agents/skills/`.
4. `SkillRouter` via LLM identifica: skill `diegoclaw-assistant`.
5. `SkillExecutor` injeta SKILL.md no system prompt.
6. `AgentLoop.run()` inicia ReAct: LLM pensa, chama tools, observa resultados.
7. Resposta final persistida no SQLite via `MemoryManager`.
8. `TelegramOutputHandler` envia a resposta ao chat.

### 6.3 Fluxos Alternativos

**Fluxo A — Falha de API OpenAI:**
1. OpenAI retorna 5xx/timeout.
2. `ProviderFactory` detecta falha, ativa DeepSeek como fallback.
3. Loop continua normalmente; usuário não percebe a troca.

**Fluxo B — Nenhuma skill match:**
1. `SkillRouter` retorna `{ skillName: null }`.
2. `AgentLoop` usa prompt base do DiegoClaw (assistente geral pt-BR).

---

## 7. Requisitos Não-Funcionais

| ID | Requisito | Valor alvo |
|----|-----------|-----------|
| RNF-01 | Latência de repasse de mensagem (excluindo LLM) | < 500ms |
| RNF-02 | Escrita SQLite | < 10ms (síncrono `better-sqlite3`) |
| RNF-03 | Tamanho máximo do arquivo DB | < 500MB |

---

## 8. Modelo de Dados

```sql
conversations {
  id TEXT PRIMARY KEY,        -- UUID único da conversa
  user_id TEXT NOT NULL,      -- telegram_user_id (whitelisted)
  provider TEXT NOT NULL,     -- 'openai' | 'deepseek'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
}

messages {
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,         -- 'user' | 'assistant' | 'system' | 'tool'
  content TEXT NOT NULL,      -- payload da mensagem
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
}
```

---

## 9. Segurança e Privacidade

- **Autenticação:** Exclusivamente via `TELEGRAM_ALLOWED_USER_IDS` no `.env`.
- **Logs:** NUNCA logar conteúdo de mensagens — apenas `user_id`, `provider`, `duration_ms`, `status`.
- **Secrets:** API keys exclusivamente via variáveis de ambiente, nunca hardcoded.
- **Prompt Injection:** Sanitização no `TelegramInputHandler` antes do AgentLoop.

---

## 10. Plano de Rollout

| Fase | Descrição | Status |
|------|-----------|--------|
| Fase 1 | Bootstrap: estrutura, specs, docs | ✅ Completo |
| Fase 2 | Meta-Skills: criação das personas especializadas | ✅ Completo |
| Fase 3 | RAG Expert Mode: 55 obras + personas consultivas + cross-domain routing | ✅ Completo (v2.0) |
| Fase 4 | Ingestão dos 55 PDFs no ChromaDB | 🏃 Próxima — `python ingest.py` |
| Fase 5 | Expansão de skills por novas áreas / novas obras | Futura |

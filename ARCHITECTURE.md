# DiegoClaw — Arquitetura

**Versão:** 2.0  
**Status:** Ingested & Active (93 Obras + OCR)  
**Data:** 2026-07-31  
**Tech Lead:** Diego William  

---

## 1. Visão Geral

O **DiegoClaw** é um agente de IA pessoal local de Diego William. Ele roda no desktop Windows, é controlado exclusivamente via **Telegram**, e utiliza LLMs externos apenas para inferência. Toda a memória e dados ficam na máquina local.

Inspirado no [SandeClaw](https://github.com/diegowilliam38/sandeco/tree/main/SandeClaw) de Sandeco, o DiegoClaw foi construído seguindo o pipeline AIOS Squad com specs, ADRs e convenções do GEMINI.md V5.2.

---

## 2. Diagrama Arquitetural

```mermaid
graph TD
    User([👤 Diego William<br/>Telegram Client])

    subgraph Telegram["📱 Telegram API"]
        Polling[Polling / Webhook]
    end

    subgraph Core["🏗️ DiegoClaw Engine (Local Windows)"]
        InputH[TelegramInputHandler<br/>Whitelist + Normalização]
        Controller[AgentController<br/>Facade]
        
        subgraph SkillSystem["🎯 Skill System (Hot-Reload)"]
            SkillLoader[SkillLoader<br/>FS .agents/skills/]
            SkillRouter[SkillRouter<br/>LLM classifica intenção]
            SkillExecutor[SkillExecutor<br/>Injeta SKILL.md no contexto]
        end

        subgraph AgentCore["🧠 Agent Loop (ReAct)"]
            Loop[AgentLoop<br/>Thought → Action → Observation]
            Registry[ToolRegistry]
            Factory[ToolFactory]
        end

        subgraph Memory["💾 Memória (SQLite)"]
            MemMgr[MemoryManager<br/>Facade + Truncamento]
            ConvRepo[ConversationRepository]
            MsgRepo[MessageRepository]
            DB[(db.sqlite)]
        end

        OutputH[TelegramOutputHandler<br/>Chunking + TypingAction]
    end

    subgraph LLM["🌐 LLMs Externos (API)"]
        OpenAI[OpenAI<br/>GPT-4o-mini<br/>Primary]
        DeepSeek[DeepSeek<br/>Fallback]
    end

    User <-->|Mensagem/Voz/Doc| Polling
    Polling --> InputH
    InputH -->|ID válido| Controller
    Controller --> SkillLoader
    SkillLoader --> SkillRouter
    SkillRouter -->|skill selecionada| SkillExecutor
    SkillExecutor --> Loop
    Loop <-->|Prompt + Tools| OpenAI
    OpenAI -.->|falha 5xx| DeepSeek
    Loop <--> Registry
    Registry --- Factory
    Loop --> MemMgr
    MemMgr --> ConvRepo & MsgRepo
    ConvRepo & MsgRepo --> DB
    Loop --> OutputH
    OutputH -->|Reply| User
```

---

## 3. Decisões de Tecnologia

| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| **Linguagem** | TypeScript / Node.js v20+ | IO assíncrono, ecossistema rico, tipagem forte |
| **Paradigma** | OOP — Classes, Interfaces, Design Patterns | Alta coesão, baixo acoplamento |
| **Banco de Dados** | SQLite (`better-sqlite3`) | Serverless, local, síncrono, zero infra adicional |
| **Interface Bot** | `grammy` | Moderno, performático, polling nativo Telegram |
| **Raciocínio IA** | ReAct Pattern | Thought → Action → Observation → Answer |
| **LLM Principal** | OpenAI GPT-4o-mini | Custo/benefício: ~$0.15/1M tokens, excelente pt-BR |
| **LLM Fallback** | DeepSeek | Fallback gratuito/barato em caso de falha OpenAI |
| **STT** | OpenAI Whisper-1 | Transcrição de áudio em tempo real de mensagens de voz |
| **TTS** | Edge-TTS v7+ (pt-BR-FranciscaNeural) + OpenAI TTS Fallback | Síntese de voz neural bidirecional em tempo real |
| **PDF** | `pdf-parse` + OCR | Extração e ingestão de documentos estruturados para o RAG |

---

## 4. Design Patterns

| Pattern | Aplicação |
|---------|-----------|
| **Facade** | `AgentController`, `MemoryManager` — simplifica subsistemas complexos |
| **Factory** | `ProviderFactory` (LLMs), `ToolFactory` (Tools) |
| **Repository** | `ConversationRepository`, `MessageRepository` — abstrai SQL |
| **Singleton** | `Database` — única conexão com SQLite |
| **Strategy** | `TelegramOutputHandler` — decide: texto puro, chunks ou arquivo |
| **Registry** | `ToolRegistry`, `SkillRegistry` — registro dinâmico de capacidades |

---

## 5. Estrutura de Pastas

```
projects/diegoclaw/
├── .agent/                  ← owned by @sm (stories, memory)
├── .agents/
│   └── skills/              ← plugins de skills (hot-reload)
│       └── diegoclaw-assistant/
│           └── SKILL.md
├── data/                    ← SQLite (gitignored)
├── tmp/                     ← arquivos temporários (gitignored)
├── docs/ADR/                ← decisões arquiteturais
├── infra/docker/            ← Dockerfile
├── infra/ci/                ← GitHub Actions
├── specs/                   ← especificações do sistema
└── src/
    ├── index.ts
    ├── bot/
    │   ├── TelegramInputHandler.ts
    │   └── TelegramOutputHandler.ts
    ├── core/
    │   ├── AgentController.ts
    │   └── AgentLoop.ts
    ├── providers/
    │   ├── IProvider.ts
    │   ├── ProviderFactory.ts
    │   ├── OpenAIProvider.ts
    │   └── DeepSeekProvider.ts
    ├── skills/
    │   ├── SkillLoader.ts
    │   ├── SkillRouter.ts
    │   └── SkillExecutor.ts
    ├── memory/
    │   ├── MemoryManager.ts
    │   ├── ConversationRepository.ts
    │   ├── MessageRepository.ts
    │   └── Database.ts
    └── tools/
        ├── BaseTool.ts
        ├── ToolRegistry.ts
        └── ToolFactory.ts
```

---

## 6. Fluxo de Processamento (Sequence)

```mermaid
sequenceDiagram
    participant U as 👤 Diego (Telegram)
    participant I as TelegramInputHandler
    participant C as AgentController
    participant S as SkillSystem
    participant L as AgentLoop (ReAct)
    participant LLM as OpenAI GPT-4o-mini
    participant M as MemoryManager
    participant O as TelegramOutputHandler

    U->>I: Envia mensagem
    I->>I: Valida whitelist (TELEGRAM_ALLOWED_USER_IDS)
    I->>C: Repassa input normalizado
    C->>S: SkillLoader carrega .agents/skills/
    S->>LLM: SkillRouter → "qual skill usar?"
    LLM-->>S: { skillName: "diegoclaw-assistant" }
    S->>C: Retorna system prompt da skill
    C->>L: AgentLoop.run(messages, systemPrompt, tools)
    loop ReAct (até MAX_ITERATIONS)
        L->>LLM: Solicita inferência
        LLM-->>L: Thought / ToolCall / FinalAnswer
        L->>L: Executa tool (se houver)
    end
    L->>M: Persiste mensagens no SQLite
    L->>O: Envia resposta final
    O->>U: Reply no Telegram
```

---

## 7. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| API OpenAI indisponível | Alto | Fallback automático para DeepSeek no `ProviderFactory` |
| Corrupção SQLite | Alto | WAL mode + backups locais periódicos |
| Estouro de contexto | Médio | `MEMORY_WINDOW_SIZE` trunca mensagens antigas |
| Billing inesperado OpenAI | Médio | `MAX_ITERATIONS=5` limita ciclos de raciocínio |
| Vazamento entre sessões | Crítico | `thread_id = telegram_user_id`, isolamento estrito |
| Prompt injection | Crítico | Sanitização no `TelegramInputHandler` antes do AgentLoop |

---

## 8. Infra e Deploy

- **Ambiente:** Windows local, terminal rodando `npm run dev`  
- **Process:** `nodemon` com hot-reload do core  
- **Dados:** `./data/db.sqlite` (local, gitignored)  
- **Temporários:** `./tmp/` (PDFs/áudios deletados após uso)  
- **Skills:** `./.agents/skills/` (hot-reload via FS síncrono)  

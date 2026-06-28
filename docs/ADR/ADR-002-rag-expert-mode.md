# ADR-002 — RAG Expert Mode: Síntese Consultiva em vez de Recuperação Literal

**Status:** Aceito  
**Data:** 2026-05-13  
**Autor:** DiegoClaw Squad (Antigravity)  
**Reviewer:** Diego William  

---

## Contexto

O DiegoClaw possui uma base de conhecimento de 55+ obras técnicas de referência (O'Reilly, Sandeco) indexadas via ChromaDB. A implementação inicial do RAG (v1) recuperava trechos relevantes e os injetava no prompt com a instrução "Use este contexto quando for pertinente" — resultando em comportamento de **paráfrase de texto**, não de consultoria especializada.

O usuário identificou que o objetivo não era um bot que "copia e cola inteligentemente", mas um **assistente que internalizou o conhecimento e raciocina como expert** — aplicando-o ao problema específico do Diego, fazendo conexões entre domínios e dando orientações acionáveis.

---

## Decisão

**Adotamos o padrão "RAG Expert Mode"** com as seguintes mudanças:

### 1. BASE_SYSTEM_PROMPT reformulado

De: assistente genérico com acesso a livros  
Para: expert que **internalizou** uma biblioteca de 55 obras e raciocina como consultor sênior multidisciplinar

### 2. Injeção RAG reformulada

De:
```
## Contexto relevante da sua base de conhecimento:
[Trecho 1]: ...
Use este contexto quando for pertinente.
```

Para:
```
## Evidências da sua base de conhecimento internalizada:
[Evidência 1 | Fonte: X]: ...

INSTRUÇÕES: Você já domina este conteúdo. NÃO repita nem parafraseie.
Use como fundamento silencioso — sintetize, aplique ao problema, conecte fontes.
```

### 3. SkillRouter v2 com Cross-Domain

O router agora retorna `{ skillName, confidence, crossDomain[] }`.  
Quando uma pergunta cruza domínios (ex: RAG + Data Engineering), o AgentController mescla os prompts das skills envolvidas.

### 4. Skills reformuladas: de "cite o livro" para "você é o expert"

Todas as 5 skills existentes foram refatoradas. 3 novas criadas:

| Skill | Domínio |
|---|---|
| `ia-engineer` | Agentes, RAG, LLMs, Prompt Engineering, MCP (29 obras) |
| `data-engineer` | Spark, Delta Lake, ETL, Data Lakehouse, SQL (10 obras) |
| `software-engineer` | Clean Code, DDD, TDD, Arquitetura (6 obras) |
| `automations` | MCP, n8n, integrações, segurança (4 obras) |
| `diegoclaw-assistant` | Assistente geral (mantido) |
| `devops` *(novo)* | Docker, Kubernetes, FastAPI, Infra IA (4 obras) |
| `python-developer` *(novo)* | Python O'Reilly, async, type hints, automação (4 obras) |
| `project-manager` *(novo)* | PMBOK, gestão de projetos de IA (4 obras) |

---

## Consequências

**Positivas:**
- Respostas de qualidade consultiva em vez de recuperação de texto
- Cross-domain automático para perguntas que cruzam engenharia de dados + IA (caso frequente)
- Skills hot-reload — novas obras podem ser adicionadas sem restart do bot
- Fallback gracioso: se ChromaDB offline, o bot usa LLM puro com as personas já internalizadas

**Tradeoffs:**
- System prompt mais longo → custo ligeiramente maior por token (aceitável com GPT-4o-mini)
- Cross-domain aumenta o contexto — para 2 skills simultâneas, o prompt pode ser mais extenso

**Alternativa descartada:**
- Manter RAG v1 com instrução "use o contexto" + aumentar número de chunks recuperados
  → Descartada: mais chunks = mais tokens gastos em paráfrase, não em raciocínio

---

## Arquivos Modificados

- `src/core/AgentController.ts` — BASE_SYSTEM_PROMPT + injeção RAG Expert Mode
- `src/skills/SkillRouter.ts` — RouterResult com cross-domain
- `.agents/skills/*/SKILL.md` — todas as 5 refatoradas + 3 novas criadas

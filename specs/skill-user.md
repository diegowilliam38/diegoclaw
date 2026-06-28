# Spec: Skill Management System (Hot-Reload)

**Versão:** 1.0  
**Status:** Aprovada  
**Data:** 2026-03-17  

---

## 1. Resumo

O sistema de Skills permite adicionar novas capacidades ao DiegoClaw sem reiniciar o processo. Skills são pastas dentro de `.agents/skills/`, cada uma com um `SKILL.md` descritivo. O fluxo é: **SkillLoader** lê os metadados → **SkillRouter** via LLM identifica qual skill usar → **SkillExecutor** injeta o conteúdo completo no system prompt do AgentLoop.

---

## 2. Goals

- [ ] **G-01:** `SkillLoader` lê síncrono todas as pastas em `.agents/skills/` a cada requisição.
- [ ] **G-02:** `SkillRouter` usa LLM barato (classificação rápida) para identificar a skill certa ou retornar `null`.
- [ ] **G-03:** `SkillExecutor` injeta o `SKILL.md` completo no contexto apenas durante a requisição — sem poluir conversas não relacionadas.

---

## 3. Non-Goals

- **NG-01:** Uma requisição aciona apenas uma skill principal — não combina múltiplas skills em paralelo.

---

## 4. Requisitos Funcionais

| ID | Requisito | Critério de Aceite |
|----|-----------|-------------------|
| RF-01 | `SkillLoader` retorna array de `{ name, description }` de cada subpasta | Funciona sem restart após adicionar nova pasta |
| RF-02 | `SkillRouter` retorna `{ skillName: string \| null }` em JSON | Parse error = fallback para null (chatbot geral) |
| RF-03 | `SkillExecutor` lê o SKILL.md da skill selecionada e retorna o conteúdo | Injeta apenas durante o ciclo da requisição ativa |

---

## 5. Formato de uma Skill

Cada skill é uma pasta dentro de `.agents/skills/` contendo um arquivo `SKILL.md` com frontmatter YAML:

```markdown
---
name: nome-da-skill
description: Descrição breve usada pelo SkillRouter para classificar
---

# Instruções detalhadas da Skill

[Conteúdo completo do system prompt especializado...]
```

---

## 6. Fluxo (Happy Path)

```
Usuário: "Crie uma spec PRD para o projeto X"
    ↓
SkillLoader: lê .agents/skills/ → [diegoclaw-assistant, code-helper]
    ↓
SkillRouter: "qual skill para 'Crie uma spec PRD'?"
    ↓ LLM responde
{ skillName: "diegoclaw-assistant" }
    ↓
SkillExecutor: lê .agents/skills/diegoclaw-assistant/SKILL.md
    ↓
AgentLoop: sys prompt = SKILL.md + histórico + input do usuário
```

---

## 7. Fluxo Alternativo — Sem Match

```
Usuário: "Que horas são?"
    ↓
SkillRouter: { skillName: null }
    ↓
AgentLoop usa prompt base do DiegoClaw (assistente geral)
```

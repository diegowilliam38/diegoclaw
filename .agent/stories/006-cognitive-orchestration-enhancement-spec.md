# Spec Técnica: 006-cognitive-orchestration-enhancement-spec

## 1. Objetivo Técnico
Refatorar a orquestração cognitiva do DiegoClaw no `SkillRouter.ts` e expandir os prompts das 8 skills em `.agents/skills/` para refletir as 93 obras ingeridas (incluindo Harness Engineering, Loop Engineering, GraphRAG Neo4j, Node.js Design Patterns e Governança de IA no Setor Público).

## 2. Mudanças de Código Necessárias

### 2.1 Prompt do `SkillRouter.ts`
- Atualizar o system prompt do `SkillRouter.ts` para instruir a classificação de novas intenções:
  - Perguntas sobre **Harness / Loop Engineering / Auto-correção** $\rightarrow$ `ia-engineer` (+ `devops` em cross-domain se envolver infra).
  - Perguntas sobre **GraphRAG / Neo4j / Knowledge Graphs** $\rightarrow$ `ia-engineer` (+ `data-engineer` em cross-domain se envolver ETL de grafos).
  - Perguntas sobre **Governança de IA / LGPD / Resoluções CNJ e TSE** $\rightarrow` `project-manager` / `diegoclaw-assistant`.

### 2.2 prompts de Skills (`.agents/skills/`)
- `ia-engineer/SKILL.md`: Adicionar literatura de Harness Engineering (Sandeco), Loop Engineering, GraphRAG (Manning/Neo4j), OpenCode Ecosystem e Spec-Driven Development.
- `devops/SKILL.md`: Adicionar literatura de Node.js Design Patterns 4ª Edição, Docker 2025 e observabilidade de microsserviços.
- `diegoclaw-assistant/SKILL.md`: Adicionar normas de Governança de IA (CNJ 615, Manifestação Técnica CNIAJ 01/2026, Memorial TRE-MA).

### 2.3 Documentação de Governança
- Criar `docs/ADR/ADR-005-orquestracao-cognitiva-expandida.md`.
- Registrar artefatos atualizados no `project-status.yaml`.

## 3. Matriz de Verificação (Critérios Binários)
- [ ] PASS: `SkillRouter.ts` compila sem erros TypeScript.
- [ ] PASS: `.agents/skills/ia-engineer/SKILL.md` contém termos exatos de Harness Engineering.
- [ ] PASS: `docs/ADR/ADR-005-orquestracao-cognitiva-expandida.md` criado e aprovado.

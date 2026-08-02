# Story: 006-cognitive-orchestration-enhancement

## 1. Visão Geral
**Como** Tech Lead do ecossistema AIOS (Diego William),
**Eu quero** atualizar a orquestração cognitiva do agente DiegoClaw e enriquecer as personas das suas skills com os conhecimentos recém-ingeridos de Harness Engineering, Loop Engineering, GraphRAG, Node.js Patterns e Governança de IA,
**Para que** o agente roteie com precisão milimétrica perguntas sobre os novos temas e aplique termos técnicos avançados de produção.

## 2. Contexto de Negócio
Após a ingestão bem-sucedida de 93 obras de referência (com suporte a OCR), o banco de vetores do DiegoClaw possui 25.545 chunks. No entanto, o `SkillRouter` e os arquivos de personas em `.agents/skills/` ainda referenciam a base antiga de 55 obras. Precisamos atualizar o roteador e as personas para garantir alinhamento perfeito com a inteligência expandida.

## 3. Critérios de Aceite
- [ ] Criar Spec Técnica correspondente em `.agent/stories/006-cognitive-orchestration-enhancement-spec.md`.
- [ ] Atualizar `.agents/skills/ia-engineer/SKILL.md` com novos domínios (Harness Engineering, Loop Engineering, GraphRAG Neo4j/Manning, OpenCode e Spec-Driven Development).
- [ ] Atualizar `.agents/skills/devops/SKILL.md` e `.agents/skills/diegoclaw-assistant/SKILL.md` com Node.js Patterns e Governança de IA (CNJ/TSE/LGPD).
- [ ] Atualizar `SkillRouter.ts` com exemplos de roteamento cross-domain para temas de Harness, Loop Engineering e Governança.
- [ ] Registrar a decisão técnica no `docs/ADR/ADR-005-orquestracao-cognitiva-expandida.md`.
- [ ] Atualizar o `project-status.yaml` refletindo o avanço de governança.

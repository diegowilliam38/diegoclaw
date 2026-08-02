# ADR-005: Orquestração Cognitiva Expandida & Atualização de Personas (93 Obras)

- **Status:** Accepted
- **Data:** 2026-07-31
- **Autor:** Diego William (Tech Lead)
- **Decisores:** @architect, @dev, @prompt-engineer

## Contexto

Com a recente adição e ingestão completa de **38 novos materiais** de referência (totalizando **93 obras** e **25.545 chunks** de conhecimento RAG), identificou-se uma lacuna no alinhamento entre o banco de dados vetorial e a camada de roteamento/prompts do agente. 

As personas em `.agents/skills/` e o prompt de classificação de intenções do `SkillRouter.ts` foram concebidos originalmente para a base antiga de 55 obras. Sem esta atualização, o LLM poderia falhar ao correlacionar termos avançados de literatura recente (como *Harness Engineering*, *Loop Engineering*, *GraphRAG Neo4j*, *Node.js 4th Ed* e *Governança de IA no Setor Público CNJ/TSE*) às personas especialistas corretas.

## Decisão

1. **Atualização do `SkillRouter.ts`:**
   - Adicionar diretrizes explícitas para detecção de intenções sobre *Harness Engineering*, *Loop Engineering*, *GraphRAG* e *Governança de IA (CNJ/TSE)*.
   - Configurar regras de **Cross-Domain** para mesclar personas (ex: `ia-engineer` + `devops` para Harness/Infra, ou `ia-engineer` + `data-engineer` para GraphRAG/Neo4j).

2. **Refatoração dos Prompts de Personas (`.agents/skills/`):**
   - **`ia-engineer`**: Enriquecido com os livros e manuais de Harness Engineering (Sandeco), Loop Engineering, Essential GraphRAG (Manning), OpenCode Ecosystem e Spec-Driven Development.
   - **`devops`**: Enriquecido com Node.js Design Patterns 4ª Edição e observabilidade de infraestrutura.
   - **`diegoclaw-assistant`**: Enriquecido com a legislação e resoluções institucionais de Governança de IA (CNJ 615, Injeção de Comandos CNIAJ 01/2026, Memorial TRE-MA).

## Consequências

- **Positivas:**
  - Respostas muito mais precisas, alinhadas com a literatura técnica mais moderna de 2025/2026.
  - Roteamento Cross-Domain afiado quando o usuário perguntar sobre a intersecção de governança, infraestrutura e agentes.
  - Eliminação de débitos técnicos no sistema de cognição do DiegoClaw.
- **Negativas:**
  - Pequeno aumento no tamanho do prompt do `SkillRouter.ts`, mitigado pela eficiência do `gpt-4o-mini`.

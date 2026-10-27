# Pacote de Submissão Acadêmica — Pós-Graduação UFG 🎓🏛️

> **Curso:** Especialização em Sistemas Inteligentes e Agentes de IA  
> **Instituição:** Universidade Federal de Goiás (UFG) — Instituto de Informática (INF)  
> **Disciplina:** Engenharia de Prompts & Spec-Driven Development (ePrompt)  
> **Docente:** Prof. Sandeco Macedo  
> **Discente:** Diego William  
> **Data Limite de Entrega:** 17/11/2026 às 23:59 (Aviso T4)  

---

## 📂 Conteúdo deste Subprojeto

Este diretório reúne todos os artefatos exigidos e de suporte para a entrega e avaliação do projeto **DiegoClaw**:

| Arquivo | Descrição |
| :--- | :--- |
| **[`DOCUMENTO_ENTREGA_UFG.md`](./DOCUMENTO_ENTREGA_UFG.md)** | **Documento oficial de entrega.** Estruturado no padrão acadêmico para exportação direta em PDF contendo identificação, resumo executivo, fundamentação teórica, arquitetura e links. |
| **[`ARTIGO_TECNICO_PROJETO.md`](./ARTIGO_TECNICO_PROJETO.md)** | Monografia técnica completa e altamente didática abordando a transição de heurísticas empíricas para Engenharia de Prompts determinística e Spec-Driven Development (SDD). |
| **[`ROTEIRO_GRAVACAO_VIDEO.md`](./ROTEIRO_GRAVACAO_VIDEO.md)** | Roteiro cronometrado segundo a segundo para a gravação do vídeo de 5 a 7 minutos exigido pela banca avaliadora. |
| **[`slides/index.html`](./slides/index.html)** | Apresentação de slides interativa em HTML5/CSS3 moderno para uso durante a gravação de tela. |
| **[`slides/slides.md`](./slides/slides.md)** | Versão em Markdown estruturado para visualização ou ferramentas como Marp. |

---

## 🎯 Alinhamento Pedagógico com a Disciplina

O DiegoClaw foi projetado para demonstrar os três pilares centrais ensinados pelo Prof. Sandeco Macedo:

1. **Spec-Driven Development (SDD):** Toda implementação de código em `src/` é precedida por histórias e especificações atômicas em `.agent/stories/`, com critérios de aceite estritamente binários (*Pass/Fail*), associadas a Decisões Arquiteturais ([`docs/ADR/`](../docs/ADR/)).
2. **Engenharia de Prompts de Nível Enterprise:** Prompts de sistema estruturados para classificação determinística de intenções (`SkillRouter.ts`), personas técnicas especializadas (`.agents/skills/`) e a técnica **RAG Expert Mode & Fusion** (síntese crítica com evidências, mitigando cópias literais e alucinações).
3. **Harness & Loop Engineering:** Estrutura resiliente de agente (*AgentLoop*), suporte a ferramentas externas (MCP), observabilidade com detecção de recursões infinitas (*Loop Detector*) e multimodalidade (Voz STT/TTS).

---

## 🚀 Como Visualizar os Slides
Abra diretamente o arquivo [`slides/index.html`](./slides/index.html) em qualquer navegador moderno.  
Use as teclas **Seta Direita / Seta Esquerda** ou **Espaço** para navegar entre os slides. Pressione **F11** para tela cheia na gravação.

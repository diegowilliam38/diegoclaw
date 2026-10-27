# Spec Técnica: 007-academic-submission-ufg-spec

## 1. Objetivo Técnico
Estruturar e implementar os artefatos acadêmicos e didáticos de entrega da disciplina de Engenharia de Prompts & Spec-Driven Development da Pós-Graduação em Sistemas Inteligentes e Agentes de IA (UFG), integrados ao ecossistema do DiegoClaw no diretório `academic-submission-ufg/`.

## 2. Especificação dos Componentes

### 2.1 Estrutura de Diretórios
```
projects/diegoclaw/academic-submission-ufg/
├── README.md
├── DOCUMENTO_ENTREGA_UFG.md       # Formato final para geração do PDF de submissão
├── ARTIGO_TECNICO_PROJETO.md       # Documento aprofundado e didático (teoria + implementação)
├── ROTEIRO_GRAVACAO_VIDEO.md      # Script detalhado do vídeo (5 a 7 min)
└── slides/
    ├── slides.md                  # Versão em markdown
    └── index.html                 # Apresentação visual interativa standalone (HTML/CSS)
```

### 2.2 Requisitos de Conteúdo
1. **DOCUMENTO_ENTREGA_UFG.md**:
   - Cabeçalho institucional formal (UFG / Instituto de Informática / Especialização).
   - Dados da disciplina e do docente (Prof. Sandeco Macedo).
   - Aluno: Diego William.
   - Resumo Executivo, Formulação do Problema, Arquitetura e Decisões Técnicas.
   - Demonstração explícita de ePrompt (RAG Expert Mode, SkillRouter, Guardrails) e SDD (ciclo de stories, specs binárias e ADRs).
   - Links do repositório, vídeo e artefatos de governança.

2. **ARTIGO_TECNICO_PROJETO.md**:
   - Tratado didático e técnico detalhado cobrindo:
     - Da heurística empírica à engenharia determinística de prompts.
     - Harness Engineering vs Prompting ingênuo.
     - Injeção RAG consultiva com deduplicação semântica.
     - Spec-Driven Development como garantia de integridade em código gerado por IA.

3. **ROTEIRO_GRAVACAO_VIDEO.md**:
   - Divisão temporal exata:
     - 00:00 - 01:00: Abertura e Motivação.
     - 01:00 - 02:30: Spec-Driven Development e Governança SDD.
     - 02:30 - 04:30: Engenharia de Prompts, RAG Expert Mode e SkillRouter.
     - 04:30 - 06:00: Live Demo prática (Telegram + Voz + Respostas).
     - 06:00 - 06:45: Conclusão, lições e agradecimento.
   - Prompts de teste práticos garantidos e validados.

4. **slides/index.html**:
   - Apresentação HTML5/CSS3 autônoma, responsiva, com visual moderno (dark mode elegante, tipografia Google Fonts, transições suaves via teclado [setas/espaço]).
   - Pronta para ser exibida em modo apresentação (F11) durante a gravação de tela.

## 3. Matriz de Verificação (Critérios Binários)
- [ ] PASS: `academic-submission-ufg/DOCUMENTO_ENTREGA_UFG.md` criado com todas as seções obrigatórias.
- [ ] PASS: `academic-submission-ufg/ARTIGO_TECNICO_PROJETO.md` criado com fundamentação teórica completa.
- [ ] PASS: `academic-submission-ufg/ROTEIRO_GRAVACAO_VIDEO.md` criado com marcações de tempo entre 5 e 7 min.
- [ ] PASS: `academic-submission-ufg/slides/index.html` funcional no navegador sem dependências externas quebradas.
- [ ] PASS: `docs/ADR/ADR-006-academic-submission-ufg.md` documentado.
- [ ] PASS: `project-status.yaml` atualizado com a Story 007.

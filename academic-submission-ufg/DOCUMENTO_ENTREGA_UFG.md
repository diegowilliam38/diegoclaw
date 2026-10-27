# UNIVERSIDADE FEDERAL DE GOIÁS — UFG
## INSTITUTO DE INFORMÁTICA (INF)
### PROGRAMA DE PÓS-GRADUAÇÃO LATO SENSU EM SISTEMAS INTELIGENTES E AGENTES DE IA

---

**DISCIPLINA:** Engenharia de Prompts & Spec-Driven Development (ePrompt)  
**DOCENTE:** Prof. Sandeco Macedo  
**DATA DE SUBMISSÃO:** 17 de Novembro de 2026  

---

# RELATÓRIO TÉCNICO DE SUBMISSÃO (AVISO T4)

## 1. Identificação do Projeto e Componentes

- **Nome do Projeto:** **DiegoClaw — Agente Híbrido Autônomo com RAG Expert Mode e Spec-Driven Development**
- **Componentes do Grupo:**
  - **Diego William** (Desenvolvedor e Pesquisador Principal)
- **Links Institucionais e de Avaliação:**
  - **Repositório GitHub:** `https://github.com/diegowilliam38/diegoclaw`
  - **Vídeo Demonstrativo (5 a 7 min):** `[INSERIR_LINK_DO_VIDEO_AQUI]`
  - **Pasta do Trabalho no Google Drive:** `https://drive.google.com/drive/u/3/folders/1fD3D89d9TbcNSm1AByYagopCAUjtPexa`

---

## 2. Breve Descrição do Projeto

O **DiegoClaw** é um ecossistema de assistência pessoal e consultiva autônoma, operado via mensageria Telegram com suporte a interação por voz bidirecional de baixa latência (Whisper STT + Microsoft Edge TTS). O projeto foi concebido e implementado para mitigar os dois maiores desafios da engenharia de software contemporânea assistida por IA: **o não-determinismo dos Modelos de Linguagem de Larga Escala (LLMs)** e a **degradação da consistência estrutural do código-fonte gerado por agentes (*Vibe Coding*)**.

Para sanar essas limitações, o DiegoClaw foi construído estritamente sob os postulados teóricos do **Spec-Driven Development (SDD)** e da **Engenharia de Prompts de Nível Enterprise**, integrando:
1. **Harness Engineering & Loop Engineering:** Um runtime agêntico desacoplado com memória relacional (SQLite), memória semântica vetorial (ChromaDB) e observabilidade de execuções com detector de recursões infinitas (*Loop Detector*).
2. **Roteamento Cognitivo Determinístico (`SkillRouter`):** Classificador de intenções guiado por *few-shot prompting* e validação estruturada, capaz de direcionar consultas para personas especialistas ou combinar raciocínios interdisciplinares (*Cross-Domain*).
3. **RAG Expert Mode & Fusion:** Uma base de conhecimento proprietária de **93 obras de referência** (totalizando **25.545 chunks** processados com suporte nativo a OCR bilíngue), onde os prompts de recuperação e síntese rejeitam cópias literais de trechos e exigem fundamentação consultiva com citação explícita de evidências e ressalvas de obsolescência temporal (*Knowledge Currency*).
4. **Governança e Guardrails:** Defesas ativas contra injeção de comandos (*Prompt Injection*) e alinhamento com diretrizes de integridade e transparência da IA.

---

## 3. Aplicação Prática dos Conceitos da Disciplina

### 3.1 Spec-Driven Development (SDD) e Zero-Trust de Código
Durante o desenvolvimento do DiegoClaw, nenhuma linha de código em produção (`src/`) foi implementada ou alterada sem a existência prévia de uma especificação formal. A governança do repositório adota o seguinte pipeline:
- **Histórias de Usuário e Negócio (`.agent/stories/[id]-story.md`):** Formalização da dor do usuário, escopo e requisitos de entrega.
- **Especificações Técnicas Atômicas (`.agent/stories/[id]-spec.md`):** Detalhamento das interfaces, contratos de dados e a **Matriz de Verificação Binária (Critérios Pass/Fail)**.
- **Registros de Decisões de Arquitetura (`docs/ADR/`):** Documentação imutável das razões que motivaram escolhas técnicas (ADR-001 a ADR-006).

O ciclo foi validado em 7 iterações formais (Stories 001 a 007), garantindo que a base de código TypeScript mantivesse **zero erros de tipagem estática** (`tsc --noEmit`) ao longo de todo o ciclo de vida.

### 3.2 Engenharia de Prompts Avançada (ePrompt)

O projeto adota padrões estruturados de engenharia de prompts que transcendem abordagens conversacionais ingênuas:

1. **Arquitetura de Personas em Camadas:** As personas dos agentes estão desacopladas em arquivos de especificação (`.agents/skills/`), cobrindo domínios como `ia-engineer`, `devops`, `software-engineer`, `data-engineer` e `project-manager`. Cada persona delimita seu vocabulário canônico, sua postura metodológica e as heurísticas que deve adotar ao responder.
2. **Classificação e Extração Semântica Determinística:** O `SkillRouter` utiliza um *System Prompt* de restrição estrita com saída serializada em JSON, avaliando intenção primária, domínio técnico, necessidade de ativação de ferramentas (Tools/MCP) e roteamento cruzado para problemas complexos.
3. **RAG Expert Mode (Mitigação de Alucinação e Paráfrase Cega):**
   - Em vez de concatenar texto recuperado diretamente no contexto de geração, o prompt atua como uma bancada de auditoria: o modelo é instruído a tratar os *chunks* do ChromaDB como **evidências de apoio a uma hipótese técnica**.
   - Caso os chunks contenham contradições ou literatura desatualizada em tópicos de rápida evolução, o prompt obriga a emissão de um alerta explícito de *Knowledge Currency*.
4. **Guardrails e Defesa Contra Adversários:** O pipeline conta com análise léxica e semântica prévia para impedir ataques de *jailbreak*, vazamento de *system prompts* ou injeções indiretas de comandos provenientes de documentos externos inseridos dinamicamente na base vetorial.

---

## 4. Arquitetura do Sistema e Stack Tecnológica

```
                              [ Usuário (Texto ou Áudio) ]
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │  Telegram (Grammy)  │
                               └──────────┬──────────┘
                                          │ (STT Whisper)
                                          ▼
                       ┌─────────────────────────────────────┐
                       │      SkillRouter & Guardrails       │
                       │  (Classificação de Intenção e Roteador)
                       └──────────────────┬──────────────────┘
                                          │
             ┌────────────────────────────┼────────────────────────────┐
             ▼                            ▼                            ▼
   ┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
   │    AgentLoop      │        │  RAG Expert Mode  │        │   MCP & Tools     │
   │  (Orquestrador)   │◄──────►│  (ChromaDB 8002)  │◄──────►│  (Notion / n8n)   │
   └─────────┬─────────┘        └───────────────────┘        └───────────────────┘
             │                            │                            │
             └────────────────────────────┼────────────────────────────┘
                                          ▼
                               ┌─────────────────────┐
                               │     Síntese LLM     │
                               │  (GPT-4o-mini / DS) │
                               └──────────┬──────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │   Edge TTS Audio    │
                               └──────────┬──────────┘
                                          │
                                          ▼
                               [ Resposta no Telegram ]
```

- **Runtime Principal:** Node.js 20+ / TypeScript 5.4 com checagem estrita de tipos.
- **Engine RAG & Ingestão:** Python 3.13 com PyMuPDF, Pytesseract (OCR bilíngue para obras escaneadas) e OpenAI `text-embedding-3-small`.
- **Bancos de Dados:** ChromaDB 1.5.0 (Memória Semântica Vetorial) e LibSQL / SQLite (Memória Conversacional Persistente).
- **Mensageria & Multimodalidade:** Grammy.js (Telegram Bot API), OpenAI Whisper (STT) e Microsoft Edge TTS (Síntese de fala neural).

---

## 5. Resultados e Conclusão

O DiegoClaw comprova que a união entre **Spec-Driven Development** e **Engenharia de Prompts Estruturada** transforma o desenvolvimento com agentes de IA em uma disciplina de engenharia rigorosa, auditável e reprodutível. O sistema opera em produção com alta taxa de assertividade no atendimento a dúvidas técnicas avançadas, executando sínteses aprofundadas com base em um acervo de 93 obras e mantendo total fidelidade aos critérios de integridade ensinados pelo Professor Sandeco na pós-graduação da UFG.

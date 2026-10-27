# Roteiro de Gravação do Vídeo de Apresentação (5 a 7 Minutos) 🎥🎙️

> **Trabalho Final:** Especialização em Sistemas Inteligentes e Agentes de IA — UFG  
> **Disciplina:** Engenharia de Prompts & Spec-Driven Development  
> **Professor:** Sandeco Macedo  
> **Apresentador:** Diego William  
> **Tempo Alvo:** Entre 5m30s e 6m30s (Limite estrito: 5 a 7 min)  

---

## 🛠️ Preparação Prévia do Ambiente (Antes de Começar a Gravar)

1. **Terminal 1:** Servidor ChromaDB rodando (`python chroma_server.py` ou `.\start_rag_server.bat` na porta 8002).
2. **Terminal 2:** Bot DiegoClaw rodando (`npm run dev`).
3. **Navegador:** Abra o arquivo `academic-submission-ufg/slides/index.html` em tela cheia (**F11**).
4. **Telegram Desktop:** Aberto no chat do DiegoClaw, limpo e pronto para interação (texto e áudio).
5. **VS Code / IDE:** Com o projeto DiegoClaw aberto, destacando a pasta `.agent/stories/`, `SkillRouter.ts` e `docs/ADR/`.

---

## ⏱️ Roteiro Minuto a Minuto

### [00:00 - 01:00] BLOCO 1: Abertura, Contexto e Objetivo
- **O que exibir na tela:** Slide 1 e Slide 2 da apresentação (`slides/index.html`).
- **Fala:**
  > *"Olá, professor Sandeco e colegas da pós-graduação em Sistemas Inteligentes e Agentes de IA da UFG. Meu nome é Diego William, e hoje apresento o projeto prático final da nossa disciplina de Engenharia de Prompts e Spec-Driven Development: o **DiegoClaw**.*  
  > *O DiegoClaw nasceu como um agente consultivo autônomo operado via Telegram e voz. O objetivo central deste projeto foi abandonar o desenvolvimento empírico — o chamado 'vibe coding' — e implementar na prática uma engenharia agêntica rigorosa, aplicando os conceitos de Spec-Driven Development, Harness Engineering e RAG Expert Mode que aprendemos com o professor Sandeco."*

---

### [01:00 - 02:30] BLOCO 2: Spec-Driven Development (SDD) na Prática
- **O que exibir na tela:** Mude para a IDE. Mostre a estrutura de pastas: `.agent/stories/`, as histórias `001` a `007` e a pasta `docs/ADR/`.
- **Abra na tela:** `006-cognitive-orchestration-enhancement-spec.md` e o `ADR-005`.
- **Fala:**
  > *"O primeiro grande pilar do DiegoClaw é o **Spec-Driven Development**. No nosso repositório, adotamos uma regra inegociável de 'Zero Trust Code': nenhuma linha de código em `src/` é criada sem que exista previamente uma história e uma especificação técnica numerada em `.agent/stories/`.*  
  > *Como vocês podem ver aqui na Story 006, cada especificação possui uma matriz de verificação estritamente binária — critérios que passam ou falham, sem zona cinza. Além disso, todas as escolhas de arquitetura ficam registradas em ADRs imutáveis. Isso garantiu que nosso sistema mantivesse zero erros de tipagem estática e total rastreabilidade durante toda a evolução."*

---

### [02:30 - 04:00] BLOCO 3: Engenharia de Prompts de Nível Enterprise (ePrompt)
- **O que exibir na tela:** Slide 3 (Engenharia de Prompts) e em seguida o arquivo `src/skills/SkillRouter.ts` e a pasta `.agents/skills/`.
- **Fala:**
  > *"O segundo pilar é a **Engenharia de Prompts Estruturada**. Nós não utilizamos prompts conversacionais ingênuos. O DiegoClaw opera com um roteador cognitivo, o `SkillRouter`, que analisa cada mensagem do usuário e emite uma classificação determinística em JSON, selecionando entre 8 personas especializadas — como ia-engineer, devops e software-engineer.*  
  > *Além disso, implementamos o **RAG Expert Mode**. O DiegoClaw possui 93 livros e manuais indexados no ChromaDB, somando mais de 25 mil chunks processados com OCR bilíngue. Mas em vez de regurgitar texto copiado da literatura, o system prompt do agente é engenheirado para instruir o modelo a atuar como um consultor sênior: ele trata os chunks recuperados como evidências de raciocínio, sintetiza respostas críticas e alerta sobre a obsolescência de informações em tópicos que evoluem rapidamente."*

---

### [04:00 - 05:45] BLOCO 4: Demonstração Prática (Live Demo no Telegram)
- **O que exibir na tela:** Telegram Desktop com o bot DiegoClaw.
- **Ação 1 (Pergunta de Engenharia de IA via Texto):**
  - Digite: *"Como o Harness Engineering e o Loop Engineering evitam alucinações e falhas em sistemas multi-agentes?"*
  - Mostre o bot respondendo com clareza, citando evidências técnicas fundamentadas, estrutura clara e sem prolixidade.
- **Ação 2 (Mensagem por Voz ou Pergunta Cruzada):**
  - Envie um áudio no Telegram: *"DiegoClaw, como aplicar Spec-Driven Development em microsserviços Node.js com Docker?"*
  - Mostre a resposta em texto fundamentada e a resposta em áudio sintetizada via Edge TTS.
- **Fala durante a demo:**
  > *"Vejam que o SkillRouter identificou imediatamente o domínio de IA, ativou a persona correspondente, recuperou as evidências no banco vetorial e entregou uma síntese consultiva estruturada. Quando acionamos por voz ou envolvemos múltiplos temas, ele realiza o roteamento cross-domain com resposta neural em áudio."*

---

### [05:45 - 06:30] BLOCO 5: Conclusão e Agradecimento
- **O que exibir na tela:** Slide final de Conclusão / Agradecimentos (`slides/index.html`).
- **Fala:**
  > *"Em conclusão, o DiegoClaw demonstra que a verdadeira inteligência de um agente não reside apenas no poder bruto do modelo fundacional, mas sim na arquitetura do Harness que o governa e na disciplina de Engenharia de Prompts e SDD que balizam sua construção.*  
  > *Agradeço imensamente ao professor Sandeco e a todo o corpo docente da UFG pela excelência da disciplina, que elevou nossa visão sobre engenharia de IA ao estado da arte. Muito obrigado!"*

---

## 💡 Dicas de Ouro para a Gravação
1. **Áudio Limpo:** Use fone/microfone próximo da boca e evite eco no ambiente.
2. **Resolução:** Grave a tela em **1080p (Full HD)** via OBS Studio ou ferramenta similar.
3. **Fluidez:** Se gaguejar numa frase, respire e repita a frase imediatamente; vídeos desse formato valorizam a naturalidade e a clareza técnica.

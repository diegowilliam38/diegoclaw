# Roteiro Master de Gravação do Vídeo (5 a 7 Minutos) 🎥🎙️

> **Trabalho Final:** Especialização em Sistemas Inteligentes e Agentes de IA — UFG  
> **Disciplina:** Engenharia de Prompts & Spec-Driven Development (ePrompt)  
> **Professor:** Sandeco Macedo  
> **Apresentador:** Diego William  
> **Tempo Recomendado:** 5m30s a 6m30s (Faixa de segurança: 5 a 7 minutos)  

---

## 🎯 Dica de Apresentação (Como soar natural e seguro)
Não tente memorizar o texto palavra por palavra! Use a técnica dos **3 Marcadores Mentais** de cada bloco:
1. Olhe para o marcador mental (a ideia central).
2. Olhe para a câmera/tela e fale com as suas próprias palavras.
3. Demonstre a ação na tela com o mouse.

---

## 🛠️ Checklist de 1 Minuto Antes de Começar (Mesa Pronta)

1. **Terminal 1:** ChromaDB rodando na porta 8002 (`start_rag_server.bat` ou `python chroma_server.py`).
2. **Terminal 2:** DiegoClaw rodando (`npm run dev`).
3. **Navegador (Aba 1):** `academic-submission-ufg/slides/index.html` em tela cheia (**F11**).
4. **Navegador (Aba 2):** Repositório GitHub aberto (`github.com/diegowilliam38/diegoclaw`).
5. **Antigravity IDE / VS Code:** Árvore aberta mostrando `.agent/stories/` e `src/skills/SkillRouter.ts`.
6. **Telegram Desktop:** Posicionado na metade da tela, lado a lado com o Terminal do bot.
7. **OBS Studio:** Aberto e minimizado. **Pressione `F9` para iniciar e `F10` para finalizar**.

---

## ⏱️ ROTEIRO MINUTO A MINUTO (Com Gatilhos e Fala Natural)

---

### 🟢 [00:00 - 01:10] BLOCO 1: Abertura e Motivação
* **O que exibir na tela:** Slide 1 (Capa MIRA) e Slide 2 (Do Vibe Coding ao SDD).
* **Marcadores Mentais para falar:**
  * Apresentação pessoal e contextualização da Pós UFG com o Prof. Sandeco.
  * O problema real: o perigo do "Vibe Coding" (código probabilístico sem contrato).
  * A resposta de engenharia: DiegoClaw construído com **Spec-Driven Development**.

* **💡 Fala Sugerida (Natural e Direta):**
  > *"Olá, professor Sandeco e colegas da pós em Sistemas Inteligentes e Agentes de IA da UFG! Sou o Diego William, e hoje venho apresentar o trabalho final da nossa disciplina de Engenharia de Prompts e Spec-Driven Development: o **DiegoClaw**.*  
  > *(Avança para o Slide 2)*  
  > *A grande motivação por trás do DiegoClaw foi superar aquela armadilha que o professor Sandeco sempre nos alertou em aula: o famoso 'Vibe Coding'. Em vez de ficarmos tentando na sorte até o código parecer que funciona, nós adotamos uma postura rigorosa de engenharia: o **Spec-Driven Development (SDD)** com **Zero Trust Code Gate**, onde nenhuma linha de código entra em produção sem especificação prévia, matriz binária e registro formal de arquitetura."*

---

### 🟢 [01:10 - 02:40] BLOCO 2: Engenharia na Prática (Antigravity IDE & GitHub)
* **O que exibir na tela:** Alterne com `Alt + Tab` para o **Antigravity IDE / VS Code**.
* **Ações na tela:**
  1. Mostre a pasta `.agent/stories/` e abra o arquivo `006-cognitive-orchestration-enhancement-spec.md` (ou `007`).
  2. Role até a **Matriz de Verificação (Critérios Binários PASS / FAIL)**.
  3. Mostre a pasta `docs/ADR/` (ADR-001 a ADR-006).
  4. Abra o arquivo `src/skills/SkillRouter.ts`.

* **Marcadores Mentais para falar:**
  * SDD real: histórias + specs técnicas numeradas com critérios matemáticos (*Pass/Fail*).
  * Reconhecimento da linhagem do código: **O `SkillRouter` veio da genial arquitetura do SandeClaw do professor Sandeco!**
  * Como você expandiu o SandeClaw no DiegoClaw: adicionou **Cross-Domain**, **RAG Expert Mode** e **8 personas especializadas**.

* **💡 Fala Sugerida (Honesta, Elegante e Técnica):**
  > *"Aqui dentro da nossa IDE, podemos ver esse método em ação. Na pasta `.agent/stories/`, cada incremento possui um par de história e especificação técnica. Reparem que na seção de verificação nós não usamos critérios opinativos: são critérios estritamente binários — ou passa, ou falha.*  
  > *(Abre o `src/skills/SkillRouter.ts`)*  
  > *E aqui no coração cognitivo, temos o `SkillRouter.ts`. É muito importante destacar que esse conceito e a base do roteador vieram originalmente do **SandeClaw**, projeto pioneiro desenvolvido pelo próprio professor Sandeco.*  
  > *Ao criar o **DiegoClaw**, eu herdei essa fundação brilhante do SandeClaw e a expandi: implementei o suporte a **Cross-Domain** (quando uma dúvida cruza múltiplos domínios técnicos, combinando personas), integrei com a nossa base de 8 personas ricas e amarrei tudo com saída em JSON estrito para garantir determinismo."*  
  > *(Muda 10 segundos para a aba do GitHub)*  
  > *"Tudo isso com rastreabilidade total nos ADRs e no nosso repositório no GitHub."*

---

### 🟢 [02:40 - 03:30] BLOCO 3: Os Bastidores do RAG Expert Mode (Terminal)
* **O que exibir na tela:** Mostre o Terminal do ChromaDB na porta 8002 ou Slide 4 do MIRA.
* **Marcadores Mentais para falar:**
  * Acervo imenso: **93 obras completas de IA** ingeridas com OCR bilíngue.
  * O volume: **25.545 chunks vetoriais** indexados no ChromaDB.
  * O diferencial do Sandeco: RAG Expert Mode (não é cópia cega, é consultoria técnica com evidências).

* **💡 Fala Sugerida:**
  > *"Nos bastidores, o DiegoClaw não faz pesquisas superficiais na web. Ele opera sobre uma base de **93 obras de referência de Inteligência Artificial** — incluindo livros de Harness Engineering, Loop Engineering, GraphRAG e Governança —, totalizando exatamente **25.545 chunks vetoriais** no ChromaDB com OCR bilíngue.*  
  > *Mas o grande pulo do gato está na Engenharia de Prompts: aplicamos o **RAG Expert Mode**. O modelo é proibido de fazer cópia literal de trechos; ele trata as evidências como base de raciocínio silencioso para emitir um parecer consultivo de nível sênior."*

---

### 🟢 [03:30 - 05:30] BLOCO 4: Demonstração Prática ao Vivo (Live Demo no Telegram)
* **O que exibir na tela:** Telegram na metade esquerda e Terminal do bot na metade direita.
* **Ação 1 — Pergunta Técnica Avançada de IA (RAG + Roteador):**
  * **Digite no Telegram:**  
    > *"DiegoClaw, como o Harness Engineering e o Loop Engineering evitam alucinações e falhas em agentes autônomos?"*
  * **Mostre o Terminal:** Aponte para o log acontecendo:
    * *"Vejam aqui no log: o SkillRouter classificou a intenção como `ia-engineer`, expandiu a busca multi-query, recuperou as evidências no ChromaDB e gerou a inferência."*
  * **Mostre o Telegram:** Leia um trecho da resposta destacando a síntese técnica sem alucinação e a estrutura clara.

* **Ação 2 — Interação Multimodal por Voz:**
  * **Grave um áudio no Telegram:**  
    > *"DiegoClaw, resuma em poucas palavras por que o Spec-Driven Development é essencial para sistemas agênticos."*
  * O bot recebe o áudio, transcreve com o Whisper, processa e responde com **Texto + Nota de Voz (Edge TTS)**.
  * **Dê o PLAY no áudio** para sair o som no vídeo!
  * **Comente:**  
    > *"Observem que o áudio foi transcrito com precisão pelo Whisper e o agente sintetizou uma resposta em áudio neural com Microsoft Edge TTS em questão de segundos."*

---

### 🟢 [05:30 - 06:15] BLOCO 5: Conclusão e Fechamento
* **O que exibir na tela:** Slide 7 do MIRA (Conclusão & Agradecimento).
* **Marcadores Mentais para falar:**
  * Síntese final: inteligência agêntica decorre do Harness e do SDD, não de força bruta.
  * Agradecimento sincero ao professor Sandeco e à coordenação da Pós UFG.

* **💡 Fala Sugerida:**
  > *(Volta para o Slide 7 do MIRA)*  
  > *"Em conclusão, o DiegoClaw comprova na prática que a confiabilidade de um agente de IA não vem do tamanho bruto do modelo, mas sim da robustez do seu **Harness** e da disciplina do **Spec-Driven Development** que governa a sua evolução.*  
  > *Agradeço imensamente ao professor Sandeco Macedo por compartilhar conosco a vanguarda da Engenharia de Prompts e do desenvolvimento agêntico, e a toda a equipe da UFG pela excelência da pós-graduação. Muito obrigado!"*
* **Aperte `F10` para encerrar a gravação!** 🎬

---

## 💎 Segredos para o Vídeo Ficar Impecável:
1. **Se errar uma palavra, não pare a gravação!** Basta respirar 2 segundos, repetir a frase com calma e continuar. Se quiser, você pode cortar depois ou deixar natural — o professor valoriza a demonstração técnica real.
2. **Deixe o volume do som do computador em 50% ou 60%** para quando você der play no áudio do Telegram, ele sair nítido na gravação sem estourar.
3. **Mantenha o ritmo dinâmico**: alterne as telas com calma usando `Alt + Tab`. O roteiro está desenhado para dar exatamente entre 5m30s e 6m30s.

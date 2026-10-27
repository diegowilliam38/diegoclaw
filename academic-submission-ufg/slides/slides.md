---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0f172a
color: #f8fafc
---

# 🤖 DiegoClaw
### Agente Híbrido Autônomo com RAG Expert Mode e Spec-Driven Development

**Pós-Graduação em Sistemas Inteligentes e Agentes de IA — UFG**  
**Disciplina:** Engenharia de Prompts & Spec-Driven Development  
**Docente:** Prof. Sandeco Macedo  
**Discente:** Diego William  

---

## 🎯 Contexto e Motivação

- **O Problema do "Vibe Coding":**
  - Indução probabilística sem contratos formais.
  - Regressões silenciosas em bases de código de agentes.
- **A Solução:**
  - **Spec-Driven Development (SDD):** Rigor de engenharia de software agêntica.
  - **Engenharia de Prompts (ePrompt):** Determinação comportamental do LLM via restrições e saída estruturada.
  - **Harness & Loop Engineering:** Arcabouço robusto para conter falhas e alucinações.

---

## 🏗️ Metodologia: Spec-Driven Development (SDD)

```
[Visão de Negócio] ──► .agent/stories/[id]-story.md
                             │
                             ▼
                 .agent/stories/[id]-spec.md
                 (Critérios Binários: PASS / FAIL)
                             │
                             ▼
                 Implementação em src/
                             │
                             ▼
                 docs/ADR/ (Memória Arquitetural)
```

- **Zero Trust Code Gate:** Proibido alterar `src/` sem especificação prévia.
- **Zero Erros TypeScript:** Tipagem estática verificada continuamente (`tsc --noEmit`).

---

## 🧠 Engenharia de Prompts Avançada (ePrompt)

1. **Roteamento Cognitivo Determinístico (`SkillRouter.ts`):**
   - Classificação em JSON estrito com *few-shot prompting*.
   - Seleção entre 8 personas técnicas desacopladas em `.agents/skills/`.
   - Suporte a consultas interdisciplinares (*Cross-Domain*).
2. **RAG Expert Mode & Fusion:**
   - Base de **93 obras** / **25.545 chunks** com OCR bilíngue.
   - Multi-query expansion + deduplicação semântica no ChromaDB.
   - Síntese consultiva: os chunks atuam como **evidências de apoio**, banindo cópias literais.
   - Guardrails ativos contra *Prompt Injection*.

---

## ⚙️ Arquitetura e Stack Tecnológica

- **Cérebro & Orquestração:** Node.js 20+ / TypeScript 5.4 / GPT-4o-mini & DeepSeek.
- **Engine RAG & Ingestão:** Python 3.13, PyMuPDF, Pytesseract, ChromaDB (Porta 8002).
- **Memória Conversacional:** SQLite local via LibSQL.
- **Multimodalidade & Mensageria:** Telegram Bot (Grammy.js), Whisper (STT) e Edge TTS (Áudio neural).
- **Observabilidade:** Detector heurístico de loops infinitos (*Loop Detector*).

---

## 🚀 Demonstração Prática (Live Demo)

- [x] Interação fluida via Telegram (Texto e Áudio).
- [x] Roteamento de persona especialista em tempo real.
- [x] Recuperação e citação crítica de evidências no ChromaDB.
- [x] Resposta multimodal (Síntese textual + áudio gerado pelo bot).

---

## 🏆 Conclusão

- A inteligência do agente emerge da **qualidade do seu Harness** e da **precisão da sua Engenharia de Prompts**.
- O **Spec-Driven Development** é o divisor de águas entre experimentos descartáveis e agentes corporativos de nível de produção.
- **Agradecimentos:** Ao Prof. Sandeco Macedo e à coordenação da Pós UFG.

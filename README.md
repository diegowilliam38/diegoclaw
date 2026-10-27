# DiegoClaw 🤖🚀

> Agente Híbrido Autônomo e Assistente Pessoal com RAG Expert Mode (93 Obras / 25.545 Chunks + OCR), MCP (Model Context Protocol), Automações via n8n/Notion, Orquestração Cognitiva Expandida e Interação por Voz Bidirecional (TTS + Whisper). Desenvolvido sob os princípios do **Spec-Driven Development (SDD)** e **GLOBAL RULES V5.12**.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-v2.0-blue)
![LangGraph](https://img.shields.io/badge/architecture-LangGraph-orange)
![KnowledgeBase](https://img.shields.io/badge/knowledge_base-93_books-purple)
![ZeroTrust](https://img.shields.io/badge/security-Zero_Trust-red)

## 🌟 O que é o DiegoClaw?
DiegoClaw é um ecossistema completo de assistência pessoal e inteligência consultiva de nível empresarial. Ele possui:
- **Cérebro Analítico & Roteador Cognitivo**: Raciocínio multi-agente via LangGraph (AgentLoop) com suporte a roteamento **Cross-Domain** de personas.
- **Base de Conhecimento RAG de Elite**: 93 obras completas de Engenharia de IA, Agentes, Harness Engineering (Sandeco), Loop Engineering, GraphRAG Neo4j, TypeScript Patterns e Governança de IA no Setor Público (CNJ 615 / TRE-MA), totalizando **25.545 chunks** com suporte a ingestão nativa de **PDFs (com OCR via PyMuPDF + Tesseract), TXT e DOCX**.
- **Braços Operacionais**: Integração fluida com MCP Servers (Notion, n8n) para executar tarefas do mundo real.
- **Voz e Audição**: Interação nativa com Whisper (STT) e Microsoft Edge TTS (Text-to-Speech) de alta performance.

## 🏗️ Arquitetura e Tecnologias
O projeto foi moldado através de Decisões de Arquitetura (ADRs) documentadas na pasta `docs/ADR`.
* **Linguagens**: TypeScript / Node.js (Core e Integrações), Python 3.13 (Engine RAG, Ingestão, Embeddings e OCR).
* **Banco de Dados**: LibSQL / SQLite (Memória conversacional) e ChromaDB (Memória Semântica Vetorial na porta 8002).
* **Processamento de Documentos**: `pypdf`, `python-docx`, `PyMuPDF (fitz)` e `pytesseract` (OCR bilíngue para livros escaneados do Kindle).
* **Observabilidade**: Tracing nativo de chamadas LLM e heurística de **Loop Detector** contra recursões infinitas.
* **Mensageria**: Grammy.js para o Telegram.
* **Segurança**: Prevenção ativa contra Prompt Injection (Whitelist + Filtros semânticos).

## 🚀 Principais Features
1. **RAG Expert Mode & Fusion**: Busca vetorial multi-query com deduplicação de contexto, aviso de *Knowledge Currency* para tópicos de rápida evolução e relatórios de cobertura (`full`, `partial`, `blind_spot`).
2. **Ingestão Dinâmica Multiformato**: Upload de arquivos `.pdf`, `.txt` e `.docx` diretamente pelo chat do Telegram, com suporte a OCR transparente e notificação em memória de curto prazo (`[EVENTO DO SISTEMA]`).
3. **MCP Workflows**: Conexão com servidores MCP (Notion, n8n) para manipulação de databases e automações.
4. **Loop Detectors & Observabilidade**: Proteção contra loops infinitos de execução de ferramentas.
5. **Respostas em Voz**: Transcrição e síntese bidirecional de mensagens de voz.

## ⚙️ Como Instalar e Rodar Localmente

### Pré-requisitos
- Node.js v20+
- Python 3.13+
- Tesseract OCR (instalado no sistema)
- Token de Bot do Telegram (BotFather)
- Chave de API OpenAI

### Passos:
1. **Clone o repositório:**
```bash
git clone https://github.com/diegowilliam38/diegoclaw.git
cd diegoclaw
```

2. **Instale as dependências (TypeScript e Python):**
```bash
npm install
pip install -r requirements.txt
```

3. **Configure as Variáveis de Ambiente:**
Copie o `.env.example` para `.env` e insira suas credenciais:
```bash
TELEGRAM_BOT_TOKEN="seu_token"
TELEGRAM_ALLOWED_USER_IDS="seu_id_telegram"
OPENAI_API_KEY="sk-..."
CHROMA_PORT=8002
```

4. **Inicie os Serviços:**
```bash
# Inicia o servidor ChromaDB
python chroma_server.py

# Inicia a ingestão de novas obras (se houver)
python ingest.py

# Em outro terminal, inicia o Bot
npm run dev
```

## 📚 Governança & Spec-Driven Development (SDD)
Este projeto adota o padrão **Spec-Driven Development (SDD)**. Nenhuma alteração no código `src/` é feita sem spec e story correspondentes em `.agent/stories/`.

### Registros de Decisão e Histórico:
- **[ADR-001](docs/ADR/ADR-001-chromadb-vector-store.md):** ChromaDB como Vector Store Local
- **[ADR-002](docs/ADR/ADR-002-rag-expert-mode.md):** RAG Expert Mode — Síntese Consultiva
- **[ADR-005](docs/ADR/ADR-005-orquestracao-cognitiva-expandida.md):** Orquestração Cognitiva Expandida & Atualização de Personas (93 Obras)
- **[ADR-006](docs/ADR/ADR-006-academic-submission-ufg.md):** Consolidação e Pacote de Submissão Acadêmica UFG
- **[Story-006](.agent/stories/006-cognitive-orchestration-enhancement-story.md):** Especificações da atualização cognitiva e RAG com OCR
- **[Story-007](.agent/stories/007-academic-submission-ufg-story.md):** Especificações da submissão acadêmica UFG

### 🎓 Submissão Acadêmica — Pós-Graduação UFG (Aviso T4)
Projeto submetido para a disciplina de **Engenharia de Prompts & Spec-Driven Development (ePrompt)** — **Prof. Sandeco Macedo**:
- **[Pacote de Submissão Acadêmica](academic-submission-ufg/)**:
  - [Documento de Entrega Oficial](academic-submission-ufg/DOCUMENTO_ENTREGA_UFG.md) (relatório para PDF)
  - [Monografia Técnica e Didática](academic-submission-ufg/ARTIGO_TECNICO_PROJETO.md) (Do Vibe Coding ao SDD)
  - [Roteiro do Vídeo (5 a 7 min)](academic-submission-ufg/ROTEIRO_GRAVACAO_VIDEO.md)
  - [Apresentação Interativa MIRA](academic-submission-ufg/slides/index.html) (HTML5/CSS3)

---
**Projeto desenvolvido no ecossistema AIOS-WORKSPACE sob a GLOBAL RULES V5.13.**

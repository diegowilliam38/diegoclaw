# DiegoClaw 🤖🚀

> Agente Híbrido Autônomo e Assistente Pessoal com integração total a RAG, MCP (Model Context Protocol), Automações via n8n/Notion e Interação por Voz Bidirecional (TTS + Whisper). Desenvolvido sob princípios de **Zero Trust Architecture** (SDD).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-v2.0-blue)
![LangGraph](https://img.shields.io/badge/architecture-LangGraph-orange)
![ZeroTrust](https://img.shields.io/badge/security-Zero_Trust-red)

## 🌟 O que é o DiegoClaw?
DiegoClaw deixou de ser um simples bot do Telegram e evoluiu para um ecossistema completo de assistência pessoal. Ele possui:
- **Cérebro Analítico**: Raciocínio multi-agente via LangGraph (AgentLoop).
- **Memória Infinita**: RAG integrado ao ChromaDB com ingestão de arquivos dinamicamente pelo chat.
- **Braços Operacionais**: Integração fluida com MCP Servers (Notion, n8n) para executar tarefas do mundo real.
- **Voz e Audição**: Interação nativa com Whisper (STT) e Microsoft Edge TTS (Text-to-Speech) de alta performance.

## 🏗️ Arquitetura e Tecnologias
O projeto foi moldado através de decisões de arquitetura profundas (ADRs) documentadas na pasta `docs/ADR`.
* **Linguagens**: TypeScript (Core e Integrações), Python (Servidor RAG e Ingestão).
* **Banco de Dados**: SQLite (Memória conversacional) e ChromaDB (Memória Semântica Vetorial).
* **Observabilidade**: Integração nativa com Langfuse para monitoramento de custos, latência e traces de raciocínio LLM.
* **Mensageria**: Grammy.js para o Telegram.
* **Segurança**: Prevenção ativa contra Prompt Injection (Whitelist + Filtros semânticos).

## 🚀 Principais Features
1. **MCP Workflows**: Acesso a integrações de ferramentas externas (Notion, n8n) acionadas autonomamente pelo LLM.
2. **Ingestão Dinâmica de RAG**: Você pode subir arquivos `.pdf` ou `.txt` diretamente pelo chat do Telegram, e o sistema fará a vetorização no background e injetará o evento na memória de curto prazo.
3. **Loop Detectors e Observabilidade**: Heurísticas avançadas implementadas no `AgentLoop` para detectar e interromper alucinações recursivas (proteção de custos OpenAI).
4. **Respostas em Voz**: Ao enviar uma mensagem de voz, o DiegoClaw ouve, entende e **responde com um áudio**, sintetizado dinamicamente, ignorando formatações markdown e gerando uma experiência de assistente inteligente fluida.

## ⚙️ Como Instalar e Rodar Localmente

### Pré-requisitos
- Node.js v18+
- Python 3.10+
- Um Token de Bot do Telegram (BotFather)
- Chaves de API (OpenAI, DeepSeek, etc.)

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
```
*(Opcional) Insira as credenciais do Langfuse no `.env` para ligar o painel de observabilidade.*

4. **Inicie os Serviços:**
Você precisa rodar o servidor RAG (Python) em background e o bot (TypeScript) em foreground.
```bash
# Inicia o servidor Python RAG na porta 8000
npm run start:rag

# Em outro terminal, inicia o Bot
npm run dev
```

## 📚 Documentação (Zero Trust)
Este projeto adota o padrão **Spec-Driven Development (SDD)**. Nenhuma feature é implementada na pasta `src/` sem que seu caso de uso (story) e especificação técnica (spec) existam. 
Consulte o histórico de desenvolvimento na pasta `.agent/stories/` para entender as regras de negócios e aprovações do Squad IA.

---
**Projeto desenvolvido de forma assistida por Inteligência Artificial — AIOS SQUAD Cockpit.**

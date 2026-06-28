# Spec: Memory Module (SQLite Persistence)

**Versão:** 1.0  
**Status:** Aprovada  
**Data:** 2026-03-17  

---

## 1. Resumo

O módulo de memória do DiegoClaw gerencia conversas persistentes em SQLite (`better-sqlite3`) e controla a janela de contexto enviada ao LLM, evitando estouro de tokens. Toda lógica de escrita/leitura SQL fica abstraída em repositories, expondo ao sistema apenas o `MemoryManager` (Facade).

---

## 2. Goals

- [ ] **G-01:** Persistir todas as mensagens de entrada e saída no SQLite local.
- [ ] **G-02:** `MemoryManager` decide automaticamente quantas mensagens incluir no contexto via `MEMORY_WINDOW_SIZE`.
- [ ] **G-03:** Desacoplar SQL dos outros módulos via padrão Repository.
- [ ] **G-04:** Singleton para a conexão com o banco (nunca abrir múltiplas conexões).

---

## 3. Non-Goals

- **NG-01:** Sem vector database (ChromaDB etc.) nesta fase — memória conversacional pura.
- **NG-02:** Sem ORM (Prisma, TypeORM) — SQL nativo via `better-sqlite3` por leveza.
- **NG-03:** Sem limpeza automática de histórico antigo — gerenciamento manual.

---

## 4. Requisitos Funcionais

| ID | Requisito | Critério de Aceite |
|----|-----------|-------------------|
| RF-01 | `MemoryManager.saveMessage()` persiste no SQLite síncrono | Escrita < 10ms |
| RF-02 | `MemoryManager.getContext()` retorna últimas N mensagens | Respeita `MEMORY_WINDOW_SIZE` |
| RF-03 | `ConversationRepository.findOrCreate()` garante conversação ativa por `user_id` | Mesma conversa reabre ao reiniciar o bot |
| RF-04 | `Database` é Singleton | Uma única instância de conexão SQLite em todo o processo |

---

## 5. Schema SQL

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','assistant','system','tool')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- WAL mode para performance e segurança
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
```

---

## 6. Interface do MemoryManager

```typescript
interface IMemoryManager {
  // Retorna ou cria conversa para o user_id
  getOrCreateConversation(userId: string): Conversation;
  
  // Salva mensagem na conversa
  saveMessage(conversationId: string, role: MessageRole, content: string): void;
  
  // Retorna últimas MEMORY_WINDOW_SIZE mensagens formatadas para o LLM
  getContext(conversationId: string): ChatMessage[];
}
```

---

## 7. Edge Cases

| Cenário | Comportamento esperado |
|---------|----------------------|
| Arquivo `.db` não existe | `Database` cria automaticamente na primeira execução |
| Dois writes simultâneos | WAL mode do SQLite resolve; `better-sqlite3` é bloqueante por design |
| `MEMORY_WINDOW_SIZE` muito alto | Trunca para últimas N mensagens sem apagar histórico persistido |

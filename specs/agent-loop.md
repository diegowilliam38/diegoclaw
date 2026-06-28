# Spec: Agent Loop (ReAct Engine)

**Versão:** 1.0  
**Status:** Aprovada  
**Data:** 2026-03-17  

---

## 1. Resumo

O **AgentLoop** é o motor central do DiegoClaw. Implementa o padrão **ReAct** (Reasoning and Acting): uma mensagem entra, é submetida ao LLM para raciocínio (`Thought`), tools são chamadas e suas respostas retornam como `Observation`, até que uma resposta final seja produzida. O loop tem limite configurável de iterações para evitar billing infinito.

---

## 2. Fluxo ReAct

```
Input (messages + systemPrompt + tools)
    ↓
[Thought] LLM raciocina sobre o contexto
    ↓
[Action] LLM decide: ToolCall ou FinalAnswer?
    ├─ ToolCall → ToolFactory instancia + executa
    │     ↓
    │  [Observation] resultado injeta no array de mensagens
    │     ↓
    │  volta ao [Thought] (próxima iteração)
    └─ FinalAnswer → resposta enviada ao usuário
```

---

## 3. Goals

- [ ] **G-01:** Implementar loop agnóstico de provider — qualquer `IProvider` funciona.
- [ ] **G-02:** Executar tool calls via `ToolFactory` e reinjetar observações no contexto.
- [ ] **G-03:** Parar deterministicamente por `MAX_ITERATIONS` com mensagem de fallback limpa.
- [ ] **G-04:** Logar cada etapa (Thought, Action, Observation) no console para monitoramento.

---

## 4. Non-Goals

- **NG-01:** Não mantém sessão suspensa aguardando input do usuário no meio de um loop ativo.
- **NG-02:** Não executa tools em paralelo — chamadas são sequenciais (Promise-based Node.js).

---

## 5. Requisitos Funcionais

| ID | Requisito | Critério de Aceite |
|----|-----------|-------------------|
| RF-01 | `AgentLoop.run()` aceita `messages[]`, `systemPrompt`, `tools[]` | Interface tipada sem ambiguidade |
| RF-02 | Hard limit de `MAX_ITERATIONS` (default: 5) | Estouro gera mensagem de fallback, não exceção não tratada |
| RF-03 | Observação de tool sempre reinjetada no array de mensagens | LLM vê resultado antes de inferir próximo thought |
| RF-04 | Log detalhado de cada etapa | Console mostra `[THOUGHT]`, `[ACTION]`, `[OBSERVATION]`, `[FINAL]` |

---

## 6. Modelo de Dados Interno

```typescript
interface AgentLoopOptions {
  messages: ChatMessage[];      // histórico de contexto
  systemPrompt: string;         // skill + instruções base
  tools: BaseTool[];            // tools disponíveis
  maxIterations?: number;       // default: process.env.MAX_ITERATIONS
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
}
```

---

## 7. Edge Cases

| Cenário | Comportamento esperado |
|---------|----------------------|
| MAX_ITERATIONS atingido | Loop para; resposta: "Desculpe, não consegui completar em X iterações." |
| Tool call com JSON inválido | Trata como erro, injeta observação de erro, continua loop |
| Provider retorna 5xx | `ProviderFactory` tenta fallback; se falhar, encerra com aviso |

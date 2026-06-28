# Spec: Telegram Output Handler

**Versão:** 1.0  
**Status:** Aprovada  
**Data:** 2026-03-17  

---

## 1. Resumo

O `TelegramOutputHandler` é responsável por enviar a resposta final do AgentLoop de volta ao usuário via Telegram. Implementa o padrão **Strategy** para decidir entre: texto simples, chunks (respostas longas) ou arquivo (`.md`, `.pdf`). Também gerencia rate limiting da API do Telegram.

---

## 2. Goals

- [ ] **G-01:** Enviar respostas de texto simples (< 4096 chars) direto.
- [ ] **G-02:** Chunkar automaticamente respostas longas (> 4096 chars) em múltiplas mensagens.
- [ ] **G-03:** Enviar arquivos `.md` quando a resposta for um documento gerado.
- [ ] **G-04:** Respeitar rate limiting da Telegram API (429 errors).

---

## 3. Non-Goals

- **NG-01:** Não formata Markdown avançado — usa `parse_mode: 'Markdown'` do Grammy.
- **NG-02:** TTS (voz) é fase futura — não implementado no MVP.

---

## 4. Requisitos Funcionais

| ID | Requisito | Critério de Aceite |
|----|-----------|-------------------|
| RF-01 | Texto ≤ 4096 chars enviado direto | `ctx.reply()` único |
| RF-02 | Texto > 4096 chars quebrado em chunks | Múltiplos `ctx.reply()` sequenciais |
| RF-03 | Arquivo `.md` enviado via `sendDocument()` | Usuário baixa o arquivo direto no Telegram |
| RF-04 | Error 429 tratado com retry + delay | Bot não quebra com rate limit |

---

## 5. Strategy Pattern

```typescript
interface OutputStrategy {
  send(ctx: Context, content: string): Promise<void>;
}

class TextStrategy implements OutputStrategy { ... }
class ChunkStrategy implements OutputStrategy { ... }
class DocumentStrategy implements OutputStrategy { ... }

// Seleção automática:
function selectStrategy(content: string): OutputStrategy {
  if (content.startsWith('FILE:')) return new DocumentStrategy();
  if (content.length > 4096) return new ChunkStrategy();
  return new TextStrategy();
}
```

---

## 6. Rate Limiting

```typescript
// Em caso de erro 429 da API Telegram
async function sendWithRetry(fn: () => Promise<void>, maxRetries = 3): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fn();
      return;
    } catch (e: any) {
      if (e?.error_code === 429) {
        const delay = (e.parameters?.retry_after ?? 5) * 1000;
        await sleep(delay);
      } else throw e;
    }
  }
}
```

# Spec: Telegram Input Handler

**Versão:** 1.0  
**Status:** Aprovada  
**Data:** 2026-03-17  

---

## 1. Resumo

O `TelegramInputHandler` é a primeira camada do DiegoClaw. Recebe eventos do Telegram via Grammy, valida a whitelist de usuários autorizados, normaliza o input (texto, documento, voz) e repassa ao `AgentController`. É a fronteira de segurança do sistema.

---

## 2. Goals

- [ ] **G-01:** Validar TODOS os inputs contra `TELEGRAM_ALLOWED_USER_IDS` antes de qualquer processamento.
- [ ] **G-02:** Normalizar mensagens de texto, documento (PDF) e voz para um formato padrão `IncomingMessage`.
- [ ] **G-03:** Sanitizar o input contra prompt injection antes de repassar ao AgentController.
- [ ] **G-04:** Emitir `typing action` enquanto o agente processa (feedback visual ao usuário).

---

## 3. Non-Goals

- **NG-01:** Não processa lógica de negócio — apenas normaliza e repassa.
- **NG-02:** Não persiste mensagens — isso é responsabilidade do `MemoryManager`.

---

## 4. Requisitos Funcionais

| ID | Requisito | Critério de Aceite |
|----|-----------|-------------------|
| RF-01 | Whitelist check em todas as mensagens | Usuário não autorizado = ignore silencioso, sem exceção |
| RF-02 | Suporte a mensagens de texto | `ctx.message.text` normalizado para `IncomingMessage` |
| RF-03 | `typing action` durante processamento | Usuário vê "DiegoClaw está digitando..." até a resposta chegar |
| RF-04 | Sanitização de prompt injection | Padrões conhecidos bloqueados antes de chegar ao AgentLoop |

---

## 5. Whitelist Security

```typescript
// TELEGRAM_ALLOWED_USER_IDS=123456789,987654321
const allowedIds = process.env.TELEGRAM_ALLOWED_USER_IDS!
  .split(',')
  .map(id => id.trim());

if (!allowedIds.includes(String(ctx.from?.id))) {
  return; // silently ignore — sem log de conteúdo
}
```

---

## 6. Prompt Injection Sanitization

```typescript
const INJECTION_PATTERNS = [
  'ignore suas instruções',
  'ignore previous instructions',
  'você agora é',
  'new persona',
  'system prompt',
  'ignore all previous',
  'esqueça tudo',
  'forget everything',
];

function sanitizeInput(message: string): string | null {
  const lower = message.toLowerCase();
  if (INJECTION_PATTERNS.some(p => lower.includes(p))) {
    // Log apenas metadata, nunca o conteúdo
    console.warn('[SECURITY] Possible injection attempt blocked');
    return null;
  }
  return message;
}
```

---

## 7. IncomingMessage Format

```typescript
interface IncomingMessage {
  userId: string;
  chatId: number;
  type: 'text' | 'document' | 'voice';
  text?: string;
  fileId?: string;    // para documento/voz (fase futura)
  mimeType?: string;  // para documento/voz (fase futura)
}
```

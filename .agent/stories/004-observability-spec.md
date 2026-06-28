# Spec: 004-observability

## 1. Responsáveis
- **Owner**: `@architect`
- **Revisão Técnica**: `@security-auditor`
- **Camada**: Core System / Providers

## 2. Objetivo Técnico
Instrumentar chamadas da API do OpenAI via SDK do `langfuse`, permitindo rastreabilidade centralizada e compatível com OpenTelemetry, e introduzir heurísticas de proteção (Loop Detectors) no `AgentLoop`.

## 3. Implementação Proposta

### 3.1. Langfuse Instrumentation (`src/providers/OpenAIProvider.ts`)
- O SDK da OpenAI deve ser envelopado usando `observeOpenAI(new OpenAI(...), { client: new Langfuse(...) })`.
- A inicialização do cliente `Langfuse` só ocorrerá se as variáveis de ambiente (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`) estiverem presentes, fazendo um *graceful fallback* para o cliente OpenAI padrão caso a observabilidade esteja desativada (Design Seguro).

### 3.2. Heurística de Loop Detector (`src/core/AgentLoop.ts`)
- Armazenar em cada iteração a assinatura (nome + argumentos) da última tool call realizada.
- Antes de executar uma nova tool call, verificar se a assinatura é idêntica à assinatura anterior.
- Se idêntica por 2 vezes seguidas (1 repetição inútil):
  1. Abortar a chamada da ferramenta.
  2. Retornar um erro sintético (ex: `Error: Loop detected. Você tentou executar a mesma ação falha novamente. Tente uma abordagem diferente.`).
  3. Incrementar um contador de `consecutiveLoops`.
- Se o contador exceder 2 tentativas forçadas, interromper o AgentLoop e retornar erro (ADE - Auto Correção).

## 4. Dependências
- `npm install langfuse`
- Variáveis requeridas: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`.

## 5. Rollback
- Desinstalar dependência e reverter os patches nos arquivos `OpenAIProvider.ts` e `AgentLoop.ts`. Nenhuma modificação no DB de produção.

# Story: 004-observability

## 1. Visão Geral
**Como** arquiteto do ecossistema AIOS (Diego William),
**Eu quero** que todas as interações do agente DiegoClaw (incluindo chamadas de LLM, ferramentas e tempo de execução) sejam rastreadas visualmente,
**Para que** eu possa depurar problemas complexos, monitorar custos, analisar latência e garantir que o agente não fique preso em loops infinitos, consumindo cota de tokens desnecessariamente.

## 2. Contexto de Negócio
O bot atingiu um nível de autonomia alto com a integração de ferramentas via Model Context Protocol (MCP). O custo financeiro (tokens do OpenAI) e o tempo de depuração de falhas assíncronas começam a crescer. Conforme exigido pela documentação interna (`ADR-009`), precisamos de um "Raio-X" das decisões do LLM, provido por um sistema de Observabilidade compatível com OpenTelemetry, aliado a uma heurística preventiva que corta execuções inúteis (Loop Detector).

## 3. Critérios de Aceite
- [x] O provider da OpenAI no DiegoClaw deve enviar as chamadas (payloads e respostas) para o LangFuse.
- [x] O loop de raciocínio (AgentLoop) deve interromper imediatamente a execução caso a IA chame exatamente a mesma ferramenta com os mesmos parâmetros repetidas vezes.
- [x] Deve ser possível ligar e desligar a telemetria caso as variáveis de ambiente não estejam configuradas.

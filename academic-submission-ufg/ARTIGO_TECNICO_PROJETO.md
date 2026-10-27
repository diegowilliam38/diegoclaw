# Monografia Técnica & Didática: Arquitetura, Engenharia de Prompts e SDD no Agente DiegoClaw

**Autor:** Diego William  
**Programa:** Pós-Graduação em Sistemas Inteligentes e Agentes de IA — UFG  
**Disciplina:** Engenharia de Prompts & Spec-Driven Development  
**Orientador / Docente:** Prof. Sandeco Macedo  

---

## Resumo Didático
O desenvolvimento de agentes autônomos baseados em Modelos de Linguagem de Grande Porte (LLMs) frequentemente sucumbe a duas armadilhas metodológicas: a ilusão do *vibe coding* (onde alterações no código são feitas por indução probabilística sem contratos formais) e o *prompting ingênuo* (onde instruções longas e ambíguas causam alucinações e perda de foco). Este artigo disseca a construção do **DiegoClaw**, um assistente agêntico consultivo que implementa **Spec-Driven Development (SDD)** e **Engenharia de Prompts de Nível Enterprise**. Demonstra-se como decompor o raciocínio agêntico em camadas funcionais, empregando roteadores semânticos com saída estruturada, síntese consultiva por RAG Fusion em 93 obras indexadas e contenção de falhas com *Harness & Loop Engineering*.

---

## 1. Introdução: O Fim do "Vibe Coding" e a Ascensão do SDD

Com o surgimento de assistentes de codificação com IA, disseminou-se a prática empírica do *vibe coding* — uma abordagem onde o desenvolvedor instrui a IA por tentativa e erro até o código "parecer funcionar". No ambiente corporativo e acadêmico, esse paradigma acarreta:
1. **Regressão Silenciosa:** Alterações em uma sub-rotina quebram contratos implícitos em outros módulos.
2. **Débito Técnico Exponencial:** Inconsistência de tipagem e ausência de especificações rastreáveis.
3. **Alucinação Arquitetural:** O modelo infere bibliotecas e métodos obsoletos ou inexistentes.

Em contrapartida, o **Spec-Driven Development (SDD)** introduz uma barreira de integridade (*Zero Trust Code Gate*):
> *"Nenhum artefato de código deve ser concebido, alterado ou excluído em produção sem a prévia existência de uma especificação formal numerada, contendo critérios de aceite binários (Pass/Fail) e registro em decisão de arquitetura (ADR)."*

No DiegoClaw, este fluxo é orquestrado através do diretório `.agent/stories/`:
```
[Necessidade de Negócio] ──► [ID]-story.md ──► [ID]-spec.md (Critérios Pass/Fail) ──► Código src/ ──► Verificação Binária
```

---

## 2. Engenharia de Prompts Avançada (ePrompt)

A Engenharia de Prompts no DiegoClaw não consiste em "perguntar bem", mas em **programar o comportamento probabilístico do LLM através de restrições determinísticas**.

### 2.1 O Classificador de Intenções (`SkillRouter.ts`)
Em sistemas multi-agentes, o erro mais crítico é o vazamento de contexto (*Context Pollution*), que ocorre ao injetar todas as instruções de todos os domínios em um único prompt massivo. Para evitar isso, o DiegoClaw desacopla o agente em um roteador semântico:

```typescript
// Exemplo conceitual do System Prompt do SkillRouter
const ROUTER_SYSTEM_PROMPT = `
Você é o Metacognitive Intent Router do DiegoClaw.
Sua missão única é analisar a mensagem do usuário e determinar:
1. A persona primária de atendimento (ia-engineer, devops, software-engineer, data-engineer, etc.).
2. Se há necessidade de ativação de ferramentas (Tools/MCP).
3. Se o problema exige uma perspectiva interdisciplinar (cross-domain: true/false).

Retorne EXCLUSIVAMENTE um objeto JSON estrito com o seguinte schema:
{
  "skill": "nome-da-skill",
  "confidence": 0.0 a 1.0,
  "requires_rag": boolean,
  "requires_tools": boolean,
  "cross_domain_skills": string[]
}
`;
```

Ao forçar o modelo a retornar JSON estruturado com validação de tipo, transformamos uma decisão conversacional livre em uma transição de estado determinística.

### 2.2 RAG Expert Mode: Síntese Crítica vs. Recuperação Literal
O RAG ingênuo (Naive RAG) comete o erro de injetar blocos de texto no prompt e pedir: *"Responda com base no texto acima"*. Isso gera respostas robóticas, cópias literais e, quando o contexto é incompleto, alucinações disfarçadas.

No DiegoClaw, aplicamos o **RAG Expert Mode**:
1. **Multi-Query Expansion (RAG Fusion):** Uma pergunta como *"Como implementar um loop de harness resiliente?"* é desdobrada internamente em 3 variantes de busca vetorial para maximizar a cobertura semântica no ChromaDB.
2. **Deduplicação e Re-ranking:** Os 8 chunks mais relevantes são selecionados e consolidados.
3. **Injeção como Evidência de Raciocínio:** O prompt instrui o modelo a agir como um **consultor sênior**:
   - Os chunks são rotulados como `[EVIDÊNCIA TÉCNICA #{ID}]`.
   - O modelo é proibido de parafrasear cegamente; ele deve cruzar as evidências com a melhor prática de engenharia.
   - Em caso de tópicos de rápida evolução (ex: LangGraph, MCP, modelos de 2026), o agente emite uma ressalva metodológica de *Knowledge Currency*.

---

## 3. Harness Engineering e Observabilidade

Inspirado nas lições do Prof. Sandeco Macedo, o DiegoClaw implementa um **Harness Agêntico** (o arcabouço de controle que guia o agente):
1. **Loop Detector:** Agentes autônomos com acesso a ferramentas podem entrar em loops infinitos de chamada de funções recursivas. O DiegoClaw monitora a sequência de *tool calls*; caso a mesma ferramenta seja executada com argumentos semelhantes em N ciclos sucessivos, o agente interrompe a execução e devolve uma mensagem de contingência ao usuário.
2. **Persistência Híbrida Desacoplada:**
   - **Curto Prazo / Sessão:** SQLite rápido (`db.sqlite`) via driver LibSQL.
   - **Longo Prazo / Semântica:** ChromaDB local na porta 8002 com 25.545 chunks de 93 obras indexadas.
   - **Voz Bidirecional:** Whisper STT e Microsoft Edge TTS desacoplados da lógica de inferência.

---

## 4. Conclusão Didática

O projeto DiegoClaw demonstra que os avanços trazidos pela IA Generativa atingem seu potencial máximo somente quando governados por princípios sólidos de Engenharia de Software. A metodologia **Spec-Driven Development** combinada à **Engenharia de Prompts Determinística** fornece o alicerce para sistemas agênticos confiáveis, robustos e prontos para ambientes de produção.

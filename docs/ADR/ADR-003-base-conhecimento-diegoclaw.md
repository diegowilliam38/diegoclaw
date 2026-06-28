# ADR-003: Biblioteca Vetorial e Base de Conhecimento do DiegoClaw
**Date:** 2026-03-23
**Status:** Accepted

## Context
O projeto **DiegoClaw** evoluiu para atuar como um "Segundo Cérebro" técnico (RAG Híbrido + ELI5 Didático). Para que o agente alcance excelência arquitetural e respostas de alto nível sem alucinações, o modelo foi alimentado com literatura técnica validada (O'Reilly, livros do prof. Sandeco e Manuais Avançados de Engenharia). 
Com a evolução constante do mercado de IA, é crítico documentar o estado exato da base de conhecimento (Vector Store local).

## Decision
Foi decidido realizar o Mapeamento Dinâmico de Base, onde o script `manage_knowledge.py` absorve dinamicamente PDFs inseridos no diretório `knowledge/`.

O estado consolidado no **V1.0 do Segundo Cérebro (Março de 2026)** possui **54 obras exclusivas** ingeridas em ChromaDB (mais de 8 mil chunks). O conteúdo é a fonte primária de verdade (`TECHNICAL_KNOWLEDGE` intent) e inclui:

1. `01___crewai_livro_basico.pdf`
2. `30 AGENTES QUE TODO ENGENHEIRO DE IA DEVE CONSTRUIR.pdf`
3. `A REVOLUÇÃO DO DATA LAKEHOUSE APROVEITANDO O PODER DO DATABRICKS PARA IA GENERATIVA E APRENDIZADO DE MAQUINA.pdf`
4. `ADOCAO_DE_LLM_ENTERPRISE.pdf`
5. `AGENTES AUTONOMOS INTELIGENTES.pdf`
6. `AGENTES DE IA COM MCP.pdf`
7. `AGENTIC IA NAS EMPRESAS.pdf`
8. `ALEM DO VIBECODING.pdf`
9. `APRENDA A USAR LANGCHAIN.pdf`
10. `APRENDA A UTILIZAR O DESIGN ORIENTADO PARA O DOMINIO.pdf`
11. `APRENDENDO_PYTHON_OREILY.pdf`
12. `ARQUITETURA DE DADOS DE AGENTIC IA.pdf`
13. `AUTOMATIZA TAREFAS CHATAS.pdf`
14. `CODIGO LIMPO-UM MANUAL DE DESENVOLVIMENTO ÁGIL DE SOFTWARE.pdf`
15. `COMO PROJETAR APLICATIVOS COM USO INTENSIVOS DE DADOS.pdf`
16. `CONSTRUINDO AGENTE DE IA COM LLMS RAG E GRAFOS DE CONHECIMENTO.pdf`
17. `CONSTRUINDO IA AGENTICA-FLUXO DE TRABALHO-AJUSTE FINO-OTIMIZAÇÃO-IMPLANTAÇÃO.pdf`
18. `CONSTRUINDO INFRAESTRUTURA DE IA.pdf`
19. `CREWAI 2 VERSÃO FINAL - BRANCA.pdf`
20. `CRIAR PRODUTOS COM IA).pdf`
21. `DELTA LAKE O GUIA DEFINITIVO.pdf`
22. `DESENVOLVIMENTO ORIENTADO A TESTES COM PYTHON.pdf`
23. `DOCKER 2025.pdf`
24. `ENGENHARIA DE CONTEXTO PARA OBSERVALIDADE.pdf`
25. `ENGENHARIA DE CONTEXTO PARA SISTEMAS MULTIAGENTES.pdf`
26. `ENGENHARIA_DE_IA.pdf`
27. `ENGENHARIA_DE_PROMPTS_LLMS.pdf`
28. `ENGENHARIA_DE_PROMTPS_IA GENERATIVA.pdf`
29. `ENTENDENDO ETL.pdf`
30. `FASTAPI.pdf`
31. `FUNDAMENTOS DE ARQUITETURA DE SOFTWARE.pdf`
32. `FUNDAMENTOS DE ENGENHARIA DE DADOS.pdf`
33. `FUNDAMENTOS DE ENGENHARIA DE SOFTWARE.pdf`
34. `GUIA DE ESTUDO DE CERTIFICAÇÃO EM DATABRICKS PARA ENGENHEIRO DE DADOS.pdf`
35. `IA GEN ON GOOGLE CLOUD.pdf`
36. `IA GENERATIVA PARA NEGOCIOS).pdf`
37. `KUBERNETES.pdf`
38. `LIVRO DE RECEITAS DE RAG COM PYTHON.pdf`
39. `MANUAL DE SEGURANÇA DEFENSIVA.pdf`
40. `MCP_Livro.pdf`
41. `PADROES DE DESIGN DE ENGENHARIA DE DADOS.pdf`
42. `PADRÕES ARQUITETONICOS AGÉTICOS PARA CONSTRUÇÃO DE SISTEMAS MULTIAGENTES.pdf`
43. `POSTGRESS 2025.pdf`
44. `PROJETAR SISTEMAS DE IA MULTIAGENTES USANDO MCP E A2A.pdf`
45. `PROJETO DE APLICAÇÕES COM USO INTENSIVO DE DADOS.pdf`
46. `Programação_assistida_por_IA.pdf`
47. `RAG Versão Final - branca.pdf`
48. `SPARK O GUIA DEFINITIVO.pdf`
49. `SQL PARA ANALISE DE DADOS.pdf`
50. `UM GUIA ILUSTRADOR PARA AGENTES DE IA.pdf`
51. `UM GUIA PARA CORPO DE CONHECIMENTO EM GERENCIAMENTO DE PROJETOS.pdf`
52. `engenharia_de_prompts_branca.pdf`
53. `prompts-em-acao-vol-2-guardrails.pdf`
54. `python__a_lingua_da_ia.pdf`

## Consequences
- **Controle Preciso:** Qualidade das respostas agora tem lastro numérico. Se o Agente alucinar uma stack atual, sabemos exatamente em qual livro o dado deveria ou não constar.
- **Limitações e Obsolescência:** Conforme bibliotecas (como Langchain ou CrewAI) ganhem releases *major*, um novo PDF deverá substituir a versão listada e um novo ciclo do `manage_knowledge.py` deve ocorrer.

## Rule for Future Projects
Sempre que o usuário desejar substituir ou incluir um material base, o livro deve ser listado num ADR de revisão e inserido via script unificado de ingestão para garantir paridade. A base atual possui 100% dos 54 livros mapeados.

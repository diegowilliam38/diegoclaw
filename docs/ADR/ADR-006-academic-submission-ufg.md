# ADR-006: Consolidação e Pacote de Submissão Acadêmica UFG (ePrompt & SDD)

- **Status:** Accepted
- **Data:** 2026-10-26
- **Autor:** Diego William
- **Contexto:** Pós-Graduação em Sistemas Inteligentes e Agentes de IA (UFG) — Disciplina de Engenharia de Prompts & Spec-Driven Development (Prof. Sandeco Macedo)

## 1. Contexto e Problema
A conclusão da disciplina de Engenharia de Prompts e Spec-Driven Development exige a submissão de um projeto prático que comprove a aplicação dos conceitos lecionados em um agente autônomo funcional. O trabalho requer a entrega de um documento formal em PDF e uma apresentação em vídeo de 5 a 7 minutos no Google Drive institucional até 17/11/2026.

Era necessário criar um subprojeto autocontido dentro do ecossistema DiegoClaw que:
1. Estruture a documentação de entrega sem fragmentar o repositório principal.
2. Detalhe formalmente o alinhamento com os ensinamentos do Prof. Sandeco (Harness Engineering, Loop Engineering, Spec-Driven Development, RAG Expert Mode e Engenharia de Contexto).
3. Forneça materiais de suporte à gravação do vídeo (roteiro e slides de apresentação).

## 2. Decisão Arquitetural
Optou-se por criar o subdiretório `academic-submission-ufg/` na raiz do projeto `diegoclaw`, estruturado da seguinte forma:
- `DOCUMENTO_ENTREGA_UFG.md`: Documento canônico no formato exigido pela coordenação para geração direta do PDF.
- `ARTIGO_TECNICO_PROJETO.md`: Monografia técnica aprofundada com diagramas e fundamentação teórica rigorosa.
- `ROTEIRO_GRAVACAO_VIDEO.md`: Roteiro cronometrado para o vídeo de 5 a 7 minutos.
- `slides/index.html`: Deck de slides interativo em HTML5/CSS3 estilizado com os padrões de excelência visual do AIOS-WORKSPACE.
- `slides/slides.md`: Versão em Markdown compatível com renderizadores de apresentação.

## 3. Consequências
- **Positivas:**
  - O projeto DiegoClaw serve como base de código real para avaliação acadêmica sem comprometer seu desenvolvimento contínuo.
  - Alinhamento explícito e verificável com todas as diretrizes pedagógicas da UFG e do Prof. Sandeco.
  - Facilidade de gravação do vídeo através do roteiro cronometrado e do slide deck interativo.
- **Negativas:**
  - Necessidade de manter a documentação acadêmica sincronizada com eventuais atualizações de código do agente.

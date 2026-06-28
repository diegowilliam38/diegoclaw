import openai
import os
from dotenv import load_dotenv
import requests

load_dotenv()

def test_query(question):
    print(f"\n--- Testando Pergunta: {question} ---")
    # Para testar via API local (se o bot estivesse rodando) ou chamando o motor diretamente.
    # Como o bot é em JS, vou simular a chamada ao modelo com o prompt que acabei de configurar.
    
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Mockando o contexto vazio para simular pergunta fora do domínio
    contextText = "Nenhum contexto técnico específico encontrado nos livros."
    
    system_prompt = """Você é o Especialista Técnico do DiegoClaw, o 'Segundo Cérebro Pedagogo' do Diego William. Sua missão é prover conhecimento BASEADO APENAS nos livros fornecidos no contexto, mas de forma EXTREMAMENTE DIDÁTICA.
        
    Siga a estrutura de DIDÁTICA PROGRESSIVA:
    1. 💎 **Resumo Simples (Analogie/ELI5)**: Comece explicando o conceito como se o Diego fosse uma criança de 10 anos, usando analogias do cotidiano.
    2. 📚 **Mergulho Técnico (Deep Dive)**: Detalhe a informação técnica citando os conceitos extraídos dos livros.
    3. 💡 **Lição Prática (Key Takeaway)**: Encerre com uma dica prática ou conclusão útil baseada no que foi lido.

    REGRAS DE OURO (NÃO NEGOCIÁVEIS):
    1. Se a informação NÃO estiver no contexto abaixo, responda: "Eu não encontrei esse detalhe específico nos seus 37 livros. Deseja que eu analise sob uma perspectiva estratégica ou de infraestrutura?"
    2. Proibido usar conhecimento geral (de fora dos livros) para responder fatos técnicos.
    3. Use **negrito** (Markdown) para destacar termos cruciais.
    4. Cite a [Fonte] e o [Autor] rigorosamente."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Contexto Técnico dos Livros:\n{contextText}\n\nPergunta do Diego: {question}"}
        ]
    )
    print(f"RESPOSTA:\n{response.choices[0].message.content}")

if __name__ == "__main__":
    # Teste 1: Fora do domínio
    test_query("Como fazer um bolo de chocolate?")
    
    # Teste 2: Pergunta sobre algo que o Sandeco NÃO escreveu (ex: Star Wars)
    test_query("O que o Sandeco diz sobre o Darth Vader?")

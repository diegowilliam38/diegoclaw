const { searchKnowledge } = require('./utils/rag');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askDiegoClaw(question) {
  console.log(`[DiegoClaw] Buscando contexto técnico...`);
  const context = await searchKnowledge(question);
  
  if (context.length === 0) {
      console.log("[DiegoClaw] Nenhum contexto encontrado nos livros.");
  }

  const contextText = context.map(c => `[Fonte: ${c.metadata.source}] ${c.text}`).join('\n\n');

  console.log(`[DiegoClaw] Gerando resposta baseada no conhecimento do Second Brain...`);
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "Você é DiegoClaw, o 'Segundo Cérebro' de Diego William. Use o contexto fornecido para responder. Se a informação não estiver no contexto, use seu conhecimento geral mas mencione que não encontrou nos livros específicos." },
      { role: "user", content: `Contexto dos Livros:\n${contextText}\n\nPergunta: ${question}` }
    ]
  });

  return response.choices[0].message.content;
}

const query = process.argv[2] || "O que é RAG?";
askDiegoClaw(query).then(res => {
    console.log("\n--- RESPOSTA DO DIEGOCLAW ---\n");
    console.log(res);
});

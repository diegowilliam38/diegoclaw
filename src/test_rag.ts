import { searchKnowledge } from './utils/rag';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askDiegoClaw(question: string) {
  console.log(`[DiegoClaw] Buscando contexto para: "${question}"...`);
  const { results: context, coverage } = await searchKnowledge(question);
  console.log(`[DiegoClaw] Cobertura: ${coverage} (${context.length} chunks)`);
  const contextText = context.map((c: any) => `[Fonte: ${c.metadata.source}] ${c.text}`).join('\n\n');

  console.log(`[DiegoClaw] Gerando resposta com contexto...`);
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "Você é DiegoClaw, o 'Segundo Cérebro' de Diego William. Use o contexto abaixo para responder de forma técnica e objetiva. Se não souber, diga que não encontrou nos livros." },
      { role: "user", content: `Contexto:\n${contextText}\n\nPergunta: ${question}` }
    ]
  });

  return response.choices[0].message.content;
}

// Pequeno teste via terminal
if (require.main === module) {
  const query = process.argv[2] || "O que é RAG?";
  askDiegoClaw(query).then(console.log);
}

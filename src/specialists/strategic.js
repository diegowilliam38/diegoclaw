const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askStrategic(question, intent) {
  const isArchitect = intent === "ARCHITECTURAL_DESIGN";
  
  const systemPrompt = isArchitect 
    ? `Você é o Arquiteto DevSecOps do DiegoClaw. Sua missão é projetar topologias resilientes e explicá-las com clareza pedagógica.
       Diretrizes:
       - Foque em Observabilidade Nativa e Segurança Zero-Trust.
       - Use diagramas Mermaid quando apropriado.
       - Explique o 'PORQUÊ' de cada decisão técnica de forma didática.
       - Stack: Docker, CI/CD, Cloud Native.`
    : `Você é o Estrategista de IA e Produto do DiegoClaw. Sua missão é guiar o Diego William com clareza e visão de ROI.
       Diretrizes:
       - Use analogias de negócios para explicar ROI e viabilidade.
       - Foque no Mecanismo Único do produto.
       - Seja didático ao explicar a vantagem competitiva.`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = { askStrategic };

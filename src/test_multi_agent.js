const { routeIntent } = require('./router');
const { askTechnical } = require('./ask_engine');
const { askStrategic } = require('./specialists/strategic');

async function testRouting() {
  const tests = [
    { q: "O que o Sandeco diz sobre GraphRAG?", expected: "TECHNICAL_KNOWLEDGE" },
    { q: "Como fazer um plano de produto para um bot jurídico?", expected: "STRATEGIC_ADVICE" },
    { q: "Como configurar Docker para ChromaDB?", expected: "ARCHITECTURAL_DESIGN" },
    { q: "Oi DiegoClaw!", expected: "GENERAL_CHAT" }
  ];

  console.log("=== INICIANDO TESTE DO ROTEADOR ===");
  for (const test of tests) {
    const { intent, reason } = await routeIntent(test.q);
    console.log(`\nPergunta: "${test.q}"`);
    console.log(`Intent Detectado: ${intent} (Razão: ${reason})`);
    
    let response;
    if (intent === "TECHNICAL_KNOWLEDGE") {
      response = await askTechnical(test.q);
    } else if (intent === "STRATEGIC_ADVICE" || intent === "ARCHITECTURAL_DESIGN") {
      response = await askStrategic(test.q, intent);
    } else {
      response = "Saudação simples detectada.";
    }
    
    console.log("--- Resposta do Especialista ---");
    console.log(response.substring(0, 150) + "...");
  }
}

testRouting().catch(err => console.error("Erro no teste:", err));

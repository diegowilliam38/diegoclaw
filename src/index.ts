import 'dotenv/config';
import { Bot } from 'grammy';
import { TelegramInputHandler } from './bot/TelegramInputHandler';
import { AgentController } from './core/AgentController';
import { MemoryManager } from './memory/MemoryManager';
import { DatabaseInstance } from './memory/Database';
import { ProviderFactory } from './providers/ProviderFactory';
import { ToolFactory } from './tools/ToolFactory';

// ============================================================
// DiegoClaw — Entrypoint Principal
// ============================================================

async function main(): Promise<void> {
  console.log('🦾 DiegoClaw iniciando...');

  // Validar variáveis de ambiente obrigatórias
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_ALLOWED_USER_IDS',
    'OPENAI_API_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Variável de ambiente obrigatória não definida: ${envVar}`);
      console.error('Copie .env.example para .env e preencha os valores.');
      process.exit(1);
    }
  }

  // Inicializar banco de dados (uma vez só no startup)
  await DatabaseInstance.initialize();

  // Inicializar ferramentas (Context7, MCP, Code Interpreter, etc.)
  await ToolFactory.initialize();

  // Inicializar dependências (Singleton pattern)
  const memoryManager = new MemoryManager();
  const provider = ProviderFactory.create(process.env.PRIMARY_PROVIDER ?? 'openai');
  const agentController = new AgentController(memoryManager, provider);

  // Inicializar bot Telegram
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
  const inputHandler = new TelegramInputHandler(bot, agentController);
  inputHandler.register();

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());

  console.log('✅ DiegoClaw online! Aguardando mensagens no Telegram...');
  await bot.start();
}

main().catch((err) => {
  console.error('💥 Erro fatal ao iniciar DiegoClaw:', err);
  process.exit(1);
});

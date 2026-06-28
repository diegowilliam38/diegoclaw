import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

async function test() {
  console.log("--- Diagnóstico de Ambiente ---");
  console.log("CWD:", process.cwd());
  console.log("OpenAI Key exists:", !!process.env.OPENAI_API_KEY);
  console.log("OpenAI Key prefix:", process.env.OPENAI_API_KEY?.substring(0, 10));
  
  try {
    const { ChromaClient } = require('chromadb');
    console.log("ChromaDB imported successfully");
    const client = new ChromaClient();
    const heartbeat = await client.heartbeat();
    console.log("ChromaDB Heartbeat:", heartbeat);
  } catch (e: any) {
    console.error("Erro ao conectar no ChromaDB:", e.message);
  }
}

test();

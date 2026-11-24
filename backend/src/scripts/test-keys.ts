import { llmAdapter } from '../ai/llm-adapter';
import { env } from '../config';

async function testKeys() {
  console.log('Testing live AI API keys...\n');
  console.log('Environment check:');
  console.log('GEMINI_API_KEY set:', Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5));
  console.log('GROQ_API_KEY set:', Boolean(env.GROQ_API_KEY && env.GROQ_API_KEY.length > 5));
  console.log('OPENROUTER_API_KEY set:', Boolean(env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY.length > 5));
  console.log();

  for (const providerName of ['groq', 'openrouter', 'gemini'] as const) {
    console.log(`--- Testing Provider: [${providerName}] ---`);
    const provider = llmAdapter.getProvider(providerName);
    if (!provider) {
      console.log(`❌ Provider ${providerName} not found`);
      continue;
    }
    console.log(`isConfigured:`, provider.isConfigured());
    try {
      const res = await provider.complete({
        systemPrompt: 'You are an AI learning coach. Keep it to one concise sentence.',
        userPrompt: 'Hello! Please confirm you are working properly.',
        temperature: 0.1,
        maxTokens: 100,
        responseFormat: 'text'
      });
      console.log(`✅ [${providerName}] Response: "${res.text.trim()}"`);
      console.log(`   Model: ${res.model} | Latency: ${res.durationMs}ms | Tokens: ${res.tokens.total}\n`);
    } catch (err: any) {
      console.log(`❌ [${providerName}] Direct Call Error: ${err.message}\n`);
    }
  }
}

testKeys();

import { env } from '../config';

async function listModels() {
  console.log('--- Fetching Groq Models ---');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` }
    });
    const data = await res.json() as any;
    console.log('Groq models:', data.data?.map((m: any) => m.id));
  } catch (e: any) {
    console.log('Groq list error:', e.message);
  }

  console.log('\n--- Fetching OpenRouter Free Models ---');
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    const data = await res.json() as any;
    const freeModels = data.data
      ?.filter((m: any) => m.id.endsWith(':free') || m.pricing?.prompt === '0')
      ?.map((m: any) => m.id);
    console.log('OpenRouter free models:', freeModels?.slice(0, 10));
  } catch (e: any) {
    console.log('OpenRouter list error:', e.message);
  }

  console.log('\n--- Fetching Gemini Models ---');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`);
    const data = await res.json() as any;
    if (data.models) {
      console.log('Gemini models:', data.models.map((m: any) => m.name));
    } else {
      console.log('Gemini error:', data);
    }
  } catch (e: any) {
    console.log('Gemini list error:', e.message);
  }
}

listModels();

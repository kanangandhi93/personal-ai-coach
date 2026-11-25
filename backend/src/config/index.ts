import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { FreeAIProvider, ProviderCapability } from '@coach/shared';

// Load .env from backend directory as well as current working directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const EnvSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('mock-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('mock-service-role-key'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  CEREBRAS_API_KEY: z.string().optional().default(''),
  ENABLE_MOCK_FALLBACK: z.string().default('true').transform((v) => v === 'true'),
  AI_REQUEST_TIMEOUT_MS: z.string().default('15000').transform(Number),
  CIRCUIT_BREAKER_COOLDOWN_SEC: z.string().default('60').transform(Number),
  MAX_RETRIES_PER_PROVIDER: z.string().default('2').transform(Number)
});

export const env = EnvSchema.parse(process.env);

// Free-tier capability matrix (Strictly ₹0 / Free Tier compliant)
export const FREE_PROVIDER_CAPABILITIES: Record<FreeAIProvider, ProviderCapability> = {
  gemini: {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    maxTokens: 8192,
    supportsJsonMode: true,
    requestsPerMinuteLimit: 15,
    requestsPerDayLimit: 1500,
    isFreeTierOnly: true
  },
  groq: {
    provider: 'groq',
    model: 'openai/gpt-oss-120b',
    maxTokens: 4096,
    supportsJsonMode: true,
    requestsPerMinuteLimit: 30,
    requestsPerDayLimit: 14400,
    isFreeTierOnly: true
  },
  openrouter: {
    provider: 'openrouter',
    model: 'liquid/lfm-3-1.7b:free',
    maxTokens: 4096,
    supportsJsonMode: true,
    requestsPerMinuteLimit: 20,
    requestsPerDayLimit: 200,
    isFreeTierOnly: true
  },
  cerebras: {
    provider: 'cerebras',
    model: 'llama3.1-8b',
    maxTokens: 4096,
    supportsJsonMode: true,
    requestsPerMinuteLimit: 30,
    requestsPerDayLimit: 14400,
    isFreeTierOnly: true
  },
  mock: {
    provider: 'mock',
    model: 'coach-mock-v1',
    maxTokens: 4096,
    supportsJsonMode: true,
    requestsPerMinuteLimit: 1000,
    requestsPerDayLimit: 100000,
    isFreeTierOnly: true
  }
};

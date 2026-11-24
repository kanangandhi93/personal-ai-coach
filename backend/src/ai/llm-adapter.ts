import { FreeAIProvider, LLMCompletionRequest, LLMCompletionInput, LLMCompletionRequestSchema } from '@coach/shared';
import { IProvider, LLMResponse } from './types';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { CerebrasProvider } from './providers/cerebras.provider';
import { MockProvider } from './providers/mock.provider';
import { circuitBreaker } from './circuit-breaker';
import { quotaTracker } from './quota-tracker';
import { env } from '../config';

export class AllFreeProvidersExhaustedError extends Error {
  public readonly isQuotaExhausted = true;
  constructor(message: string) {
    super(message);
    this.name = 'AllFreeProvidersExhaustedError';
  }
}

export class LLMProviderAdapter {
  private providers: Map<FreeAIProvider, IProvider> = new Map();
  public mockProvider: MockProvider;

  constructor() {
    const gemini = new GeminiProvider();
    const groq = new GroqProvider();
    const openrouter = new OpenRouterProvider();
    const cerebras = new CerebrasProvider();
    const mock = new MockProvider();

    this.mockProvider = mock;

    this.providers.set('gemini', gemini);
    this.providers.set('groq', groq);
    this.providers.set('openrouter', openrouter);
    this.providers.set('cerebras', cerebras);
    this.providers.set('mock', mock);
  }

  public getProvider(name: FreeAIProvider): IProvider | undefined {
    return this.providers.get(name);
  }

  public getAvailableProviders(): FreeAIProvider[] {
    const available: FreeAIProvider[] = [];
    for (const [name, provider] of this.providers.entries()) {
      if (provider.isConfigured() && circuitBreaker.isAvailable(name)) {
        available.push(name);
      }
    }
    return available;
  }

  /**
   * Unified execution method with capability checks, circuit breaker,
   * quota enforcement, and automatic zero-cost fallback across eligible providers.
   */
  public async execute(rawRequest: LLMCompletionInput, userId = 'system-evaluator'): Promise<LLMResponse> {
    const request = LLMCompletionRequestSchema.parse(rawRequest);

    // Determine candidate provider order
    const candidateOrder: FreeAIProvider[] = [];

    if (request.preferredProvider && this.providers.has(request.preferredProvider as FreeAIProvider)) {
      candidateOrder.push(request.preferredProvider as FreeAIProvider);
    }

    // Default priority order for free providers
    const defaultPriority: FreeAIProvider[] = ['gemini', 'groq', 'openrouter', 'cerebras'];
    for (const p of defaultPriority) {
      if (!candidateOrder.includes(p)) {
        candidateOrder.push(p);
      }
    }

    // Always include mock as final fallback if enabled
    if (env.ENABLE_MOCK_FALLBACK && !candidateOrder.includes('mock')) {
      candidateOrder.push('mock');
    }

    const errors: Array<{ provider: string; error: string }> = [];

    for (const providerName of candidateOrder) {
      const provider = this.providers.get(providerName);
      if (!provider || !provider.isConfigured()) {
        continue;
      }

      // Check circuit breaker state
      if (!circuitBreaker.isAvailable(providerName)) {
        errors.push({
          provider: providerName,
          error: 'Circuit breaker is OPEN (cooling down after rate limit or errors).'
        });
        continue;
      }

      // Check quota limits
      const quotaCheck = quotaTracker.canMakeRequest(providerName);
      if (!quotaCheck.allowed) {
        errors.push({
          provider: providerName,
          error: quotaCheck.reason || 'Quota limit exceeded'
        });
        continue;
      }

      // Attempt completion with retry
      let attempt = 0;
      const maxRetries = providerName === 'mock' ? 1 : env.MAX_RETRIES_PER_PROVIDER;

      while (attempt < maxRetries) {
        attempt++;
        try {
          const response = await provider.complete(request);

          // Record success
          circuitBreaker.recordSuccess(providerName);
          quotaTracker.recordUsage({
            userId,
            provider: providerName,
            model: response.model,
            promptTokens: response.tokens.prompt,
            completionTokens: response.tokens.completion,
            totalTokens: response.tokens.total,
            durationMs: response.durationMs,
            success: true
          });

          return response;
        } catch (err: any) {
          const isRateLimit = err?.statusCode === 429 || err?.message?.includes('429') || err?.message?.includes('rate');
          circuitBreaker.recordFailure(providerName, err.message, isRateLimit);

          quotaTracker.recordUsage({
            userId,
            provider: providerName,
            model: 'unknown',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            durationMs: 0,
            success: false,
            errorMessage: err.message
          });

          errors.push({
            provider: providerName,
            error: `Attempt ${attempt}/${maxRetries} failed: ${err.message}`
          });

          if (isRateLimit) {
            // Immediate fallback on rate limit, do not retry same provider
            break;
          }
        }
      }
    }

    // If we reach here, all free providers failed or exhausted
    const failureSummary = errors.map(e => `[${e.provider}]: ${e.error}`).join(' | ');
    throw new AllFreeProvidersExhaustedError(
      `Zero-Paid Guardrail Activated: All free AI providers are exhausted or unavailable. State safely paused. Diagnostics: ${failureSummary}`
    );
  }
}

export const llmAdapter = new LLMProviderAdapter();

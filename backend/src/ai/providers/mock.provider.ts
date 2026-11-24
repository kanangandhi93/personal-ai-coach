import { FreeAIProvider, LLMCompletionRequest } from '@coach/shared';
import { IProvider, LLMResponse } from '../types';
import { env, FREE_PROVIDER_CAPABILITIES } from '../../config';

export class MockProvider implements IProvider {
  public readonly name: FreeAIProvider = 'mock';
  private simulateRateLimit = false;

  public isConfigured(): boolean {
    return env.ENABLE_MOCK_FALLBACK;
  }

  public setSimulateRateLimit(simulate: boolean): void {
    this.simulateRateLimit = simulate;
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMResponse> {
    if (this.simulateRateLimit) {
      const err = new Error('Mock 429 Too Many Requests: Rate limit exceeded');
      (err as any).statusCode = 429;
      throw err;
    }

    const caps = FREE_PROVIDER_CAPABILITIES.mock;
    const durationMs = 45;

    let text = `[Mock AI Response from ${caps.model}]: Successfully processed your instruction: "${request.userPrompt.slice(0, 80)}..."`;
    let parsedJson: any = undefined;

    if (request.responseFormat === 'json') {
      parsedJson = {
        title: 'Diagnostic & Learning Overview',
        summary: `Mock AI evaluated the prompt: ${request.userPrompt.slice(0, 100)}`,
        confidence: 0.95,
        details: {
          evaluatedAt: new Date().toISOString(),
          status: 'verified_zero_cost',
          provider: 'mock'
        }
      };
      text = JSON.stringify(parsedJson, null, 2);
    }

    return {
      text,
      parsedJson,
      provider: this.name,
      model: caps.model,
      tokens: {
        prompt: 120,
        completion: 80,
        total: 200
      },
      durationMs
    };
  }
}

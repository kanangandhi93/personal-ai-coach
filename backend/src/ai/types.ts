import { FreeAIProvider, LLMCompletionRequest } from '@coach/shared';

export interface LLMResponse {
  text: string;
  parsedJson?: any;
  provider: FreeAIProvider;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  durationMs: number;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ProviderHealth {
  provider: FreeAIProvider;
  state: CircuitState;
  failureCount: number;
  consecutiveSuccessCount: number;
  lastFailureTime?: number;
  cooldownUntil?: number;
  lastErrorMessage?: string;
}

export interface IProvider {
  readonly name: FreeAIProvider;
  isConfigured(): boolean;
  complete(request: LLMCompletionRequest): Promise<LLMResponse>;
}

import { FreeAIProvider } from '@coach/shared';
import { CircuitState, ProviderHealth } from './types';
import { env } from '../config';

export class CircuitBreaker {
  private healthMap: Map<FreeAIProvider, ProviderHealth> = new Map();
  private readonly failureThreshold = 3;
  private readonly cooldownMs: number;

  constructor(cooldownSec?: number) {
    this.cooldownMs = (cooldownSec ?? env.CIRCUIT_BREAKER_COOLDOWN_SEC) * 1000;
  }

  public getHealth(provider: FreeAIProvider): ProviderHealth {
    if (!this.healthMap.has(provider)) {
      this.healthMap.set(provider, {
        provider,
        state: 'CLOSED',
        failureCount: 0,
        consecutiveSuccessCount: 0
      });
    }
    const health = this.healthMap.get(provider)!;

    // Check if cooldown has expired for an OPEN circuit
    if (health.state === 'OPEN' && health.cooldownUntil && Date.now() >= health.cooldownUntil) {
      health.state = 'HALF_OPEN';
    }

    return health;
  }

  public isAvailable(provider: FreeAIProvider): boolean {
    const health = this.getHealth(provider);
    return health.state === 'CLOSED' || health.state === 'HALF_OPEN';
  }

  public recordSuccess(provider: FreeAIProvider): void {
    const health = this.getHealth(provider);
    health.consecutiveSuccessCount += 1;
    health.failureCount = 0;
    health.state = 'CLOSED';
    health.cooldownUntil = undefined;
    health.lastErrorMessage = undefined;
  }

  public recordFailure(provider: FreeAIProvider, errorMessage?: string, isRateLimit = false): void {
    const health = this.getHealth(provider);
    health.failureCount += 1;
    health.consecutiveSuccessCount = 0;
    health.lastFailureTime = Date.now();
    health.lastErrorMessage = errorMessage;

    // Immediate open on 429 rate limit or if threshold is reached
    if (isRateLimit || health.failureCount >= this.failureThreshold) {
      health.state = 'OPEN';
      health.cooldownUntil = Date.now() + this.cooldownMs;
    }
  }

  public reset(): void {
    this.healthMap.clear();
  }
}

export const circuitBreaker = new CircuitBreaker();

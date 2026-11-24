import { Router, Response } from 'express';
import { LLMCompletionRequestSchema, FreeAIProvider } from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { circuitBreaker } from '../ai/circuit-breaker';
import { quotaTracker } from '../ai/quota-tracker';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Test & generate AI completion through provider-independent adapter
router.post('/complete', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validatedRequest = LLMCompletionRequestSchema.parse(req.body);
    const userId = req.user?.id || 'anonymous';
    const response = await llmAdapter.execute(validatedRequest, userId);
    return res.json(response);
  } catch (error) {
    next(error);
  }
});

// Inspect provider status, circuit breaker state, and quota usage
router.get('/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const providers: FreeAIProvider[] = ['gemini', 'groq', 'openrouter', 'cerebras', 'mock'];

  const statusList = providers.map(p => {
    const health = circuitBreaker.getHealth(p);
    const quota = quotaTracker.getStatus(p);
    const providerInstance = llmAdapter.getProvider(p);

    return {
      provider: p,
      isConfigured: providerInstance ? providerInstance.isConfigured() : false,
      circuitState: health.state,
      failureCount: health.failureCount,
      dailyQuotaLimit: quota.dailyQuotaLimit,
      dailyUsed: quota.dailyUsed,
      dailyRemaining: quota.dailyRemaining,
      tokensToday: quota.tokensToday
    };
  });

  return res.json({
    timestamp: new Date().toISOString(),
    providers: statusList,
    zeroPaidGuardrailActive: true
  });
});

export default router;

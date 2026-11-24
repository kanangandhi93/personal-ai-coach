import { Router, Response } from 'express';
import { quotaTracker } from '../ai/quota-tracker';
import { circuitBreaker } from '../ai/circuit-breaker';
import { ExportRepository } from '../db/repositories/export.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';
import { FreeAIProvider } from '@coach/shared';

const router = Router();

// Resource & quota monitoring
router.get('/usage', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const providers: FreeAIProvider[] = ['gemini', 'groq', 'openrouter', 'cerebras', 'mock'];

  const stats = providers.map(p => {
    const quota = quotaTracker.getStatus(p);
    const health = circuitBreaker.getHealth(p);
    return {
      provider: p,
      circuitState: health.state,
      dailyQuotaLimit: quota.dailyQuotaLimit,
      dailyUsed: quota.dailyUsed,
      dailyRemaining: quota.dailyRemaining,
      tokensToday: quota.tokensToday,
      isNearLimit: quota.dailyRemaining < (quota.dailyQuotaLimit * 0.1)
    };
  });

  return res.json({
    timestamp: new Date().toISOString(),
    zeroCostPolicy: 'STRICT_FREE_TIER_ONLY',
    providers: stats
  });
});

// Full data export (JSON)
router.get('/export', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const exportData = await ExportRepository.exportAllUserData(userId);
    return res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// Full account & progress erasure (GDPR)
router.delete('/user-data', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const result = await ExportRepository.deleteAllUserData(userId);
    return res.json({
      success: true,
      message: 'All learner goals, progress, and notes have been permanently erased.',
      details: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router, Response } from 'express';
import { RecordReviewResultSchema } from '@coach/shared';
import { SpacedRepetitionEngine } from '../engines/spaced-repetition.engine';
import { AdaptiveLifecycleEngine } from '../engines/adaptive-lifecycle.engine';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Schedule initial spaced repetition review (Day 1)
router.post('/schedule', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const { conceptId, conceptName } = req.body;
    if (!conceptId) return res.status(400).json({ error: 'conceptId is required' });

    const review = await SpacedRepetitionEngine.scheduleInitialReview(userId, conceptId, conceptName);
    return res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// Record spaced repetition review result
router.post('/record', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = RecordReviewResultSchema.parse(req.body);
    const updated = await SpacedRepetitionEngine.processReviewResult(validated.scheduleId, validated.recallScore);
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Get upcoming, overdue, and weak concept priority queues
router.get('/queue', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const queue = await SpacedRepetitionEngine.getReviewQueue(userId);
    return res.json(queue);
  } catch (error) {
    next(error);
  }
});

// Dynamic next-activity recommendation from Adaptive Lifecycle Engine
router.get('/next-activity/:goalId', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const nextActivity = await AdaptiveLifecycleEngine.determineNextActivity(req.params.goalId, userId);
    return res.json(nextActivity);
  } catch (error) {
    next(error);
  }
});

export default router;

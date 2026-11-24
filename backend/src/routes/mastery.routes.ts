import { Router, Response } from 'express';
import { EvaluateMasteryRequestSchema } from '@coach/shared';
import { EvaluatorAgent } from '../agents/evaluator.agent';
import { MasteryRepository } from '../db/repositories/mastery.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Evaluate and compute L0-L6 mastery level with evidence breakdown
router.post('/evaluate', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = EvaluateMasteryRequestSchema.parse(req.body);

    const mastery = await EvaluatorAgent.evaluateMastery({
      conceptId: validated.conceptId,
      conceptName: validated.conceptName,
      userId,
      evidence: validated.evidence
    });

    return res.json(mastery);
  } catch (error) {
    next(error);
  }
});

// Get user's overall mastery summary and distribution (L0 - L6)
router.get('/summary', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const summary = await MasteryRepository.getMasterySummary(userId);
    return res.json(summary);
  } catch (error) {
    next(error);
  }
});

// List all tracked concepts
router.get('/concepts', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const concepts = await MasteryRepository.getAllMasteryForUser(userId);
    return res.json(concepts);
  } catch (error) {
    next(error);
  }
});

export default router;

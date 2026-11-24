import { Router, Response } from 'express';
import { DoubtQuerySchema } from '@coach/shared';
import { DoubtSolverAgent } from '../agents/doubt-solver.agent';
import { DoubtsRepository } from '../db/repositories/doubts.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Submit doubt and receive multi-angle pedagogical resolution
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = DoubtQuerySchema.parse(req.body);

    const doubt = await DoubtSolverAgent.solveDoubt({
      userId,
      question: validated.question,
      goalId: validated.goalId,
      lessonId: validated.lessonId,
      conceptId: validated.conceptId,
      previousExplanations: validated.previousExplanations
    });

    return res.status(201).json(doubt);
  } catch (error) {
    next(error);
  }
});

// List all doubts for user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const doubts = await DoubtsRepository.getDoubtsByUserId(userId);
    return res.json(doubts);
  } catch (error) {
    next(error);
  }
});

// Get doubt by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const doubt = await DoubtsRepository.getDoubtById(req.params.id);
    if (!doubt) return res.status(404).json({ error: 'Doubt not found' });
    return res.json(doubt);
  } catch (error) {
    next(error);
  }
});

export default router;

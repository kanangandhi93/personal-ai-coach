import { Router, Response } from 'express';
import { PracticeExerciseRequestSchema, PracticeSubmissionSchema } from '@coach/shared';
import { PracticeAgent } from '../agents/practice.agent';
import { PracticeRepository } from '../db/repositories/practice.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Generate new tiered practice exercise
router.post('/exercise', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = PracticeExerciseRequestSchema.parse(req.body);

    const exercise = await PracticeAgent.generateExercise({
      goalId: validated.goalId,
      conceptId: validated.conceptId,
      topic: validated.topic,
      difficulty: validated.difficulty,
      userId
    });

    return res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

// Submit code/solution for safe evaluation
router.post('/submit', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = PracticeSubmissionSchema.parse(req.body);

    const evaluation = await PracticeAgent.evaluateSubmission({
      exerciseId: validated.exerciseId,
      userCodeOrAnswer: validated.userCodeOrAnswer,
      hintsUsedCount: validated.hintsUsedCount,
      userId
    });

    return res.json(evaluation);
  } catch (error) {
    next(error);
  }
});

// Get exercise details
router.get('/exercise/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const exercise = await PracticeRepository.getExerciseById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    return res.json(exercise);
  } catch (error) {
    next(error);
  }
});

export default router;

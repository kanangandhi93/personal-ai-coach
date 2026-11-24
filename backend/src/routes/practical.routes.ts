import { Router, Response } from 'express';
import { GeneratePracticalRequestSchema, SubmitPracticalSchema } from '@coach/shared';
import { PracticalAgent } from '../agents/practical.agent';
import { PracticalsRepository } from '../db/repositories/practicals.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Generate hands-on practical task
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = GeneratePracticalRequestSchema.parse(req.body);

    const task = await PracticalAgent.generatePracticalTask({
      goalId: validated.goalId,
      userId,
      title: validated.title,
      domain: validated.domain
    });

    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Get practical task details
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const task = await PracticalsRepository.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  } catch (error) {
    next(error);
  }
});

// Submit practical solution
router.post('/:id/submit', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = SubmitPracticalSchema.parse({
      ...req.body,
      taskId: req.params.id
    });

    const submission = await PracticalAgent.evaluatePracticalSubmission({
      taskId: validated.taskId,
      userId,
      submissionPayload: validated.submissionPayload
    });

    return res.json(submission);
  } catch (error) {
    next(error);
  }
});

export default router;

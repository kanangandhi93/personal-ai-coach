import { Router, Response } from 'express';
import { TeacherExplanationRequestSchema } from '@coach/shared';
import { CurriculumRepository } from '../db/repositories/curriculum.repository';
import { TeacherAgent } from '../agents/teacher.agent';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get lesson details & learner progress
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const lesson = await CurriculumRepository.getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const progress = await CurriculumRepository.getLessonProgress(req.user?.id || 'learner-dev', req.params.id);
    return res.json({ lesson, progress });
  } catch (error) {
    next(error);
  }
});

// Teach concept with Teacher Agent
router.post('/:id/teach', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const { goalId, conceptName, style, timeSpentSeconds } = req.body;

    if (!goalId || !conceptName) {
      return res.status(400).json({ error: 'goalId and conceptName are required' });
    }

    const explanation = await TeacherAgent.teachConcept({
      goalId,
      lessonId: req.params.id,
      conceptName,
      style,
      userId,
      timeSpentSeconds
    });

    return res.json(explanation);
  } catch (error) {
    next(error);
  }
});

// Record lesson progress
router.post('/:id/progress', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const { status, timeSpentSeconds } = req.body;

    const result = await CurriculumRepository.updateLessonProgress(
      userId,
      req.params.id,
      status || 'in_progress',
      timeSpentSeconds || 60
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

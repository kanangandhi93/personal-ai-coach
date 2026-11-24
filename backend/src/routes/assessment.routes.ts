import { Router, Response } from 'express';
import { GenerateAssessmentRequestSchema, SubmitAssessmentAttemptSchema } from '@coach/shared';
import { ExamInterviewAgent } from '../agents/exam-interview.agent';
import { AssessmentsRepository } from '../db/repositories/assessments.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Generate an assessment, test, or mock interview
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = GenerateAssessmentRequestSchema.parse(req.body);

    const assessment = await ExamInterviewAgent.generateAssessment({
      goalId: validated.goalId,
      userId,
      title: validated.title,
      assessmentType: validated.assessmentType,
      questionCount: validated.questionCount,
      timeLimitMinutes: validated.timeLimitMinutes
    });

    return res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
});

// Get assessment details
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const assessment = await AssessmentsRepository.getAssessmentById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json(assessment);
  } catch (error) {
    next(error);
  }
});

// Idempotent attempt submission & grading
router.post('/:id/submit', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = SubmitAssessmentAttemptSchema.parse({
      ...req.body,
      assessmentId: req.params.id
    });

    const attempt = await ExamInterviewAgent.evaluateAttempt({
      assessmentId: validated.assessmentId,
      userId,
      idempotencyKey: validated.idempotencyKey,
      answers: validated.answers
    });

    return res.json(attempt);
  } catch (error) {
    next(error);
  }
});

// Attempt history & comparison
router.get('/:id/attempts', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const attempts = await AssessmentsRepository.getAttemptsByAssessment(req.params.id, userId);
    return res.json(attempts);
  } catch (error) {
    next(error);
  }
});

export default router;

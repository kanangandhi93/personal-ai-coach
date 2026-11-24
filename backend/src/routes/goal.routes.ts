import { Router, Response } from 'express';
import { 
  CreateLearningGoalSchema, 
  UpdateLearningGoalSchema, 
  StageOverrideRequestSchema,
  LifecycleStage 
} from '@coach/shared';
import { GoalsRepository } from '../db/repositories/goals.repository';
import { CurriculumRepository } from '../db/repositories/curriculum.repository';
import { CurriculumAgent } from '../agents/curriculum.agent';
import { LearningOrchestrator } from '../agents/orchestrator.agent';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Create new Learning Goal & automatically generate curriculum roadmap
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = CreateLearningGoalSchema.parse(req.body);

    const goal = await GoalsRepository.createGoal({
      userId,
      title: validated.title,
      description: validated.description,
      targetMasteryLevel: validated.targetMasteryLevel,
      currentMasteryLevel: 'L0' as any,
      pathMode: validated.pathMode,
      currentStage: LifecycleStage.STAGE_1_PREREQUISITE_ASSESSMENT,
      isArchived: false
    });

    // Generate initial curriculum roadmap
    const roadmap = await CurriculumAgent.generateRoadmap(goal, userId);

    return res.status(201).json({ goal, roadmap });
  } catch (error) {
    next(error);
  }
});

// List all active goals for user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const goals = await GoalsRepository.getGoalsByUserId(userId);
    return res.json(goals);
  } catch (error) {
    next(error);
  }
});

// Get goal by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const goal = await GoalsRepository.getGoalById(req.params.id, userId);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    return res.json(goal);
  } catch (error) {
    next(error);
  }
});

// Update goal
router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = UpdateLearningGoalSchema.parse(req.body);
    const updated = await GoalsRepository.updateGoal(req.params.id, validated, userId);
    if (!updated) return res.status(404).json({ error: 'Goal not found' });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete goal
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const success = await GoalsRepository.deleteGoal(req.params.id, userId);
    if (!success) return res.status(404).json({ error: 'Goal not found' });
    return res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get curriculum roadmap for a goal
router.get('/:id/roadmap', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const roadmap = await CurriculumRepository.getRoadmapByGoalId(req.params.id);
    if (!roadmap) {
      // If not yet generated, generate it now
      const goal = await GoalsRepository.getGoalById(req.params.id);
      if (!goal) return res.status(404).json({ error: 'Goal not found' });
      const newRoadmap = await CurriculumAgent.generateRoadmap(goal, req.user?.id || 'learner-dev');
      return res.json(newRoadmap);
    }
    return res.json(roadmap);
  } catch (error) {
    next(error);
  }
});

// Dynamically adapt roadmap for weak areas
router.post('/:id/roadmap/adapt', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { weakConceptName } = req.body;
    if (!weakConceptName) {
      return res.status(400).json({ error: 'weakConceptName is required' });
    }
    const adapted = await CurriculumAgent.adaptRoadmapForWeakConcept(
      req.params.id,
      weakConceptName,
      req.user?.id || 'learner-dev'
    );
    return res.json(adapted);
  } catch (error) {
    next(error);
  }
});

// Get next action from Learning Orchestrator
router.get('/:id/orchestrator', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const goal = await GoalsRepository.getGoalById(req.params.id, req.user?.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    const decision = await LearningOrchestrator.evaluateNextAction(goal);
    return res.json(decision);
  } catch (error) {
    next(error);
  }
});

// Learner stage override
router.post('/:id/orchestrator/override', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = StageOverrideRequestSchema.parse(req.body);
    const userId = req.user?.id || 'learner-dev';
    const updated = await LearningOrchestrator.overrideStage(
      req.params.id,
      validated.targetStage,
      userId,
      validated.reason
    );
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Advance to next stage
router.post('/:id/orchestrator/advance', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const updated = await LearningOrchestrator.advanceStage(req.params.id, userId);
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import healthRoutes from './health.routes';
import aiRoutes from './ai.routes';
import goalRoutes from './goal.routes';
import lessonRoutes from './lesson.routes';
import notesRoutes from './notes.routes';
import doubtRoutes from './doubt.routes';
import practiceRoutes from './practice.routes';
import assessmentRoutes from './assessment.routes';
import practicalRoutes from './practical.routes';
import masteryRoutes from './mastery.routes';
import reviewRoutes from './review.routes';
import researchRoutes from './research.routes';
import resourceRoutes from './resource.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/api/ai', aiRoutes);
router.use('/api/goals', goalRoutes);
router.use('/api/lessons', lessonRoutes);
router.use('/api/notes', notesRoutes);
router.use('/api/doubts', doubtRoutes);
router.use('/api/practice', practiceRoutes);
router.use('/api/assessments', assessmentRoutes);
router.use('/api/practicals', practicalRoutes);
router.use('/api/mastery', masteryRoutes);
router.use('/api/review', reviewRoutes);
router.use('/api/research', researchRoutes);
router.use('/api/resources', resourceRoutes);

export default router;

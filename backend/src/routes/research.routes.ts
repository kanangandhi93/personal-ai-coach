import { Router, Response } from 'express';
import { VerifyClaimRequestSchema } from '@coach/shared';
import { ResearchAgent } from '../agents/research.agent';
import { ReferencesRepository } from '../db/repositories/references.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Verify technical claim & attach authoritative citation
router.post('/verify', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = VerifyClaimRequestSchema.parse(req.body);

    const result = await ResearchAgent.verifyTechnicalClaim({
      claim: validated.claim,
      topic: validated.topic,
      userId,
      targetVersion: validated.targetVersion
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// List all verified references
router.get('/references', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const conceptId = req.query.conceptId as string | undefined;

    if (conceptId) {
      const refs = await ReferencesRepository.getReferencesByConcept(conceptId);
      return res.json(refs);
    }

    const allRefs = await ReferencesRepository.getAllReferencesForUser(userId);
    return res.json(allRefs);
  } catch (error) {
    next(error);
  }
});

export default router;

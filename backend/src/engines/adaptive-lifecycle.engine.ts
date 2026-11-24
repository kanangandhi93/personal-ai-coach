import { SpacedRepetitionEngine } from './spaced-repetition.engine';
import { GoalsRepository } from '../db/repositories/goals.repository';
import { MasteryRepository } from '../db/repositories/mastery.repository';

export interface NextLearningActivity {
  goalId: string;
  activityType: 'spaced_repetition' | 'remedial_practice' | 'advance_lesson' | 'mock_exam';
  title: string;
  reason: string;
  conceptId?: string;
  priority: 'critical' | 'high' | 'normal';
}

export class AdaptiveLifecycleEngine {
  public static async determineNextActivity(goalId: string, userId: string): Promise<NextLearningActivity> {
    const goal = await GoalsRepository.getGoalById(goalId, userId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);

    // Check 1: Any overdue spaced repetition reviews?
    const queue = await SpacedRepetitionEngine.getReviewQueue(userId);
    if (queue.overdueRevisions.length > 0) {
      const topOverdue = queue.overdueRevisions[0];
      return {
        goalId,
        activityType: 'spaced_repetition',
        title: `Spaced Retention Review: ${topOverdue.conceptName}`,
        reason: `Interval Day ${topOverdue.intervalStage} review is overdue. Solidify retention before advancing.`,
        conceptId: topOverdue.conceptId,
        priority: 'critical'
      };
    }

    // Check 2: Any flagged weak concepts (< 50% confidence)?
    if (queue.weakConceptPriority.length > 0) {
      const weakest = queue.weakConceptPriority[0];
      return {
        goalId,
        activityType: 'remedial_practice',
        title: `Remedial Reinforcement: ${weakest.conceptName}`,
        reason: `Current mastery is at ${weakest.currentLevel} (${weakest.confidenceScore}% confidence). Target this weak spot with progressive hints.`,
        conceptId: weakest.conceptId,
        priority: 'high'
      };
    }

    // Check 3: Default curriculum stage progression
    return {
      goalId,
      activityType: 'advance_lesson',
      title: `Proceed with Stage ${goal.currentStage}`,
      reason: `Foundations are solid. Continue sequential lifecycle mastery.`,
      priority: 'normal'
    };
  }
}

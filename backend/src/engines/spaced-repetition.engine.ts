import { ReviewScheduleRecord, ReviewQueueSummary, MasteryLevel } from '@coach/shared';
import { ReviewRepository } from '../db/repositories/review.repository';
import { MasteryRepository } from '../db/repositories/mastery.repository';

export class SpacedRepetitionEngine {
  private static readonly intervals = [1, 3, 7, 30]; // Days

  public static async scheduleInitialReview(userId: string, conceptId: string, conceptName?: string): Promise<ReviewScheduleRecord> {
    const today = new Date();
    const dueDate = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return ReviewRepository.scheduleReview({
      conceptId,
      conceptName: conceptName || 'Key Concept',
      userId,
      intervalStage: 1,
      dueDate,
      status: 'pending',
      retentionScore: 100
    });
  }

  public static async processReviewResult(scheduleId: string, recallScore: number): Promise<ReviewScheduleRecord> {
    const existing = await ReviewRepository.getReviewById(scheduleId);
    if (!existing) throw new Error(`Review schedule ${scheduleId} not found`);

    let nextIntervalDays: number;
    let nextStageIndex: number;

    if (recallScore >= 80) {
      // Advance to next interval (1 -> 3 -> 7 -> 30)
      const currentIndex = this.intervals.indexOf(existing.intervalStage);
      nextStageIndex = Math.min(this.intervals.length - 1, currentIndex + 1);
      nextIntervalDays = this.intervals[nextStageIndex];
    } else if (recallScore >= 60) {
      // Maintain same interval
      nextIntervalDays = existing.intervalStage;
    } else {
      // Reset back to Day 1 on poor recall
      nextIntervalDays = 1;
    }

    const today = new Date();
    const nextDueDate = new Date(today.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const updated = await ReviewRepository.updateReview(scheduleId, {
      intervalStage: nextIntervalDays,
      dueDate: nextDueDate,
      status: 'completed',
      retentionScore: recallScore,
      lastReviewedAt: today.toISOString()
    });

    return updated!;
  }

  public static async getReviewQueue(userId: string): Promise<ReviewQueueSummary> {
    const all = await ReviewRepository.getReviewsForUser(userId);
    const today = new Date().toISOString().slice(0, 10);

    const upcomingRevisions: ReviewScheduleRecord[] = [];
    const overdueRevisions: ReviewScheduleRecord[] = [];

    all.forEach(r => {
      if (r.dueDate < today && r.status !== 'completed') {
        overdueRevisions.push({ ...r, status: 'overdue' });
      } else if (r.dueDate >= today) {
        upcomingRevisions.push(r);
      }
    });

    // Identify weak concepts from mastery records
    const masteryList = await MasteryRepository.getAllMasteryForUser(userId);
    const weakConceptPriority = masteryList
      .filter(m => m.confidenceScore < 60 || m.currentLevel === MasteryLevel.L0 || m.currentLevel === MasteryLevel.L1)
      .map(m => ({
        conceptId: m.conceptId,
        conceptName: m.conceptName || 'Fundamental Concept',
        currentLevel: m.currentLevel,
        confidenceScore: m.confidenceScore
      }))
      .sort((a, b) => a.confidenceScore - b.confidenceScore);

    return {
      upcomingRevisions,
      overdueRevisions,
      weakConceptPriority
    };
  }
}

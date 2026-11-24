import { UserExportData } from '@coach/shared';
import { GoalsRepository } from './goals.repository';
import { NotesRepository } from './notes.repository';
import { MasteryRepository } from './mastery.repository';
import { ReviewRepository } from './review.repository';

export class ExportRepository {
  public static async exportAllUserData(userId: string): Promise<UserExportData> {
    const goals = await GoalsRepository.getGoalsByUserId(userId);
    const notes = await NotesRepository.getNotesByUserId(userId);
    const masterySummary = await MasteryRepository.getMasterySummary(userId);
    const reviewSchedule = await ReviewRepository.getReviewsForUser(userId);

    return {
      exportTimestamp: new Date().toISOString(),
      userId,
      goals,
      notes,
      masterySummary,
      reviewSchedule
    };
  }

  public static async deleteAllUserData(userId: string): Promise<{ success: boolean; deletedCount: number }> {
    const goals = await GoalsRepository.getGoalsByUserId(userId);
    for (const g of goals) {
      await GoalsRepository.deleteGoal(g.id, userId);
    }
    const notes = await NotesRepository.getNotesByUserId(userId);
    for (const n of notes) {
      await NotesRepository.deleteNote(n.id, userId);
    }
    return { success: true, deletedCount: goals.length + notes.length };
  }
}

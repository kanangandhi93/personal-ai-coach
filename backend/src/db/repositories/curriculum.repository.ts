import { CurriculumRoadmap, LessonItem } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class CurriculumRepository {
  private static roadmapsStore: Map<string, CurriculumRoadmap> = new Map();
  private static lessonProgressStore: Map<string, { status: string; timeSpentSeconds: number }> = new Map();

  public static async saveRoadmap(roadmap: CurriculumRoadmap): Promise<CurriculumRoadmap> {
    this.roadmapsStore.set(roadmap.goalId, roadmap);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('curriculum_versions').insert({
        goal_id: roadmap.goalId,
        version_number: roadmap.versionNumber,
        overview: roadmap.overview,
        dependency_graph: { concepts: roadmap.concepts }
      });
    } catch {
      // Offline fallback
    }

    return roadmap;
  }

  public static async getRoadmapByGoalId(goalId: string): Promise<CurriculumRoadmap | null> {
    const cached = this.roadmapsStore.get(goalId);
    if (cached) return cached;
    return null;
  }

  public static async getLessonById(lessonId: string): Promise<LessonItem | null> {
    for (const roadmap of this.roadmapsStore.values()) {
      for (const module of roadmap.modules) {
        const found = module.lessons.find(l => l.id === lessonId);
        if (found) return found;
      }
    }
    return null;
  }

  public static async updateLessonProgress(userId: string, lessonId: string, status: string, timeSpentSeconds: number) {
    const key = `${userId}:${lessonId}`;
    this.lessonProgressStore.set(key, { status, timeSpentSeconds });

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('lesson_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        status,
        time_spent_seconds: timeSpentSeconds,
        last_accessed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
    } catch {
      // Fallback
    }

    return { lessonId, status, timeSpentSeconds };
  }

  public static async getLessonProgress(userId: string, lessonId: string) {
    const key = `${userId}:${lessonId}`;
    return this.lessonProgressStore.get(key) || { status: 'not_started', timeSpentSeconds: 0 };
  }
}

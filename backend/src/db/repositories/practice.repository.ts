import { PracticeExercise, PracticeEvaluation } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export interface PracticeSubmissionRecord {
  id: string;
  userId: string;
  exerciseId: string;
  userCodeOrAnswer: string;
  hintsUsedCount: number;
  evaluation?: PracticeEvaluation;
  submittedAt: string;
}

export class PracticeRepository {
  private static exercisesStore: Map<string, PracticeExercise> = new Map();
  private static submissionsStore: Map<string, PracticeSubmissionRecord> = new Map();

  public static async saveExercise(exercise: PracticeExercise): Promise<PracticeExercise> {
    this.exercisesStore.set(exercise.id, exercise);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('questions').insert({
        id: exercise.id,
        user_id: '00000000-0000-0000-0000-000000000001',
        question_type: 'coding',
        prompt: exercise.prompt,
        difficulty: exercise.difficulty,
        hints: exercise.progressiveHints,
        correct_answer: { rubric: exercise.solutionRubric }
      });
    } catch {
      // Offline fallback
    }

    return exercise;
  }

  public static async getExerciseById(id: string): Promise<PracticeExercise | null> {
    return this.exercisesStore.get(id) || null;
  }

  public static async saveSubmission(sub: Omit<PracticeSubmissionRecord, 'id' | 'submittedAt'>): Promise<PracticeSubmissionRecord> {
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const record: PracticeSubmissionRecord = {
      ...sub,
      id,
      submittedAt: now
    };

    this.submissionsStore.set(id, record);
    return record;
  }

  public static async getSubmissionsByExercise(exerciseId: string, userId: string): Promise<PracticeSubmissionRecord[]> {
    const res: PracticeSubmissionRecord[] = [];
    for (const s of this.submissionsStore.values()) {
      if (s.exerciseId === exerciseId && s.userId === userId) {
        res.push(s);
      }
    }
    return res.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
  }
}

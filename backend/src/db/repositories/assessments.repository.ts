import { AssessmentRecord, AssessmentAttemptRecord } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class AssessmentsRepository {
  private static assessmentsStore: Map<string, AssessmentRecord> = new Map();
  private static attemptsStore: Map<string, AssessmentAttemptRecord> = new Map();

  public static async saveAssessment(assessment: AssessmentRecord): Promise<AssessmentRecord> {
    this.assessmentsStore.set(assessment.id, assessment);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('assessments').insert({
        id: assessment.id,
        goal_id: assessment.goalId,
        user_id: assessment.userId,
        title: assessment.title,
        assessment_type: assessment.assessmentType,
        time_limit_minutes: assessment.timeLimitMinutes,
        passing_score: assessment.passingScore,
        questions_list: assessment.questions
      });
    } catch {
      // Offline fallback
    }

    return assessment;
  }

  public static async getAssessmentById(id: string): Promise<AssessmentRecord | null> {
    return this.assessmentsStore.get(id) || null;
  }

  public static async createAttempt(attempt: Omit<AssessmentAttemptRecord, 'id' | 'startedAt'>): Promise<AssessmentAttemptRecord> {
    // Enforce idempotency: if attempt with same idempotencyKey exists for user, return existing
    if (attempt.idempotencyKey) {
      for (const existing of this.attemptsStore.values()) {
        if (existing.userId === attempt.userId && existing.idempotencyKey === attempt.idempotencyKey) {
          return existing;
        }
      }
    }

    const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const record: AssessmentAttemptRecord = {
      ...attempt,
      id,
      startedAt: now
    };

    this.attemptsStore.set(id, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('assessment_attempts').insert({
        id: record.id,
        assessment_id: record.assessmentId,
        user_id: record.userId,
        status: record.status,
        idempotency_key: record.idempotencyKey,
        started_at: record.startedAt
      });
    } catch {
      // Offline fallback
    }

    return record;
  }

  public static async gradeAttempt(
    attemptId: string, 
    score: number, 
    feedback: Record<string, any>,
    responses: AssessmentAttemptRecord['responses']
  ): Promise<AssessmentAttemptRecord | null> {
    const existing = this.attemptsStore.get(attemptId);
    if (!existing) return null;

    existing.status = 'graded';
    existing.score = score;
    existing.feedback = feedback;
    existing.responses = responses;
    existing.submittedAt = new Date().toISOString();

    this.attemptsStore.set(attemptId, existing);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('assessment_attempts').update({
        score,
        status: 'graded',
        feedback,
        submitted_at: existing.submittedAt
      }).eq('id', attemptId);
    } catch {
      // Offline fallback
    }

    return existing;
  }

  public static async getAttemptsByAssessment(assessmentId: string, userId: string): Promise<AssessmentAttemptRecord[]> {
    const list: AssessmentAttemptRecord[] = [];
    for (const a of this.attemptsStore.values()) {
      if (a.assessmentId === assessmentId && a.userId === userId) {
        list.push(a);
      }
    }
    return list.sort((a, b) => ((b.submittedAt || b.startedAt) > (a.submittedAt || a.startedAt) ? 1 : -1));
  }
}

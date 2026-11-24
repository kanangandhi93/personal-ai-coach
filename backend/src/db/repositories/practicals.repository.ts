import { PracticalTaskRecord, PracticalSubmissionRecord } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class PracticalsRepository {
  private static tasksStore: Map<string, PracticalTaskRecord> = new Map();
  private static submissionsStore: Map<string, PracticalSubmissionRecord> = new Map();

  public static async saveTask(task: PracticalTaskRecord): Promise<PracticalTaskRecord> {
    this.tasksStore.set(task.id, task);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('practical_tasks').insert({
        id: task.id,
        goal_id: task.goalId,
        user_id: task.userId,
        title: task.title,
        domain: task.domain,
        instructions_markdown: task.instructionsMarkdown,
        starter_template: task.starterTemplate,
        validation_criteria: task.validationCriteria
      });
    } catch {
      // Offline fallback
    }

    return task;
  }

  public static async getTaskById(id: string): Promise<PracticalTaskRecord | null> {
    return this.tasksStore.get(id) || null;
  }

  public static async saveSubmission(sub: Omit<PracticalSubmissionRecord, 'id' | 'submittedAt'>): Promise<PracticalSubmissionRecord> {
    const id = `psub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const record: PracticalSubmissionRecord = {
      ...sub,
      id,
      submittedAt: now
    };

    this.submissionsStore.set(id, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('practical_submissions').insert({
        id: record.id,
        task_id: record.taskId,
        user_id: record.userId,
        submission_payload: record.submissionPayload,
        status: record.status,
        score: record.score,
        evaluation_report: record.evaluationReport
      });
    } catch {
      // Offline fallback
    }

    return record;
  }

  public static async getSubmissionsByTask(taskId: string, userId: string): Promise<PracticalSubmissionRecord[]> {
    const list: PracticalSubmissionRecord[] = [];
    for (const s of this.submissionsStore.values()) {
      if (s.taskId === taskId && s.userId === userId) {
        list.push(s);
      }
    }
    return list.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
  }
}

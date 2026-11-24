import { ReviewScheduleRecord } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class ReviewRepository {
  private static reviewsStore: Map<string, ReviewScheduleRecord> = new Map();

  public static async scheduleReview(review: Omit<ReviewScheduleRecord, 'id'>): Promise<ReviewScheduleRecord> {
    const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: ReviewScheduleRecord = { ...review, id };

    this.reviewsStore.set(id, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('review_schedule').insert({
        id: record.id,
        concept_id: record.conceptId,
        user_id: record.userId,
        interval_stage: record.intervalStage,
        due_date: record.dueDate,
        status: record.status,
        retention_score: record.retentionScore
      });
    } catch {
      // Offline fallback
    }

    return record;
  }

  public static async getReviewById(id: string): Promise<ReviewScheduleRecord | null> {
    return this.reviewsStore.get(id) || null;
  }

  public static async updateReview(id: string, updates: Partial<ReviewScheduleRecord>): Promise<ReviewScheduleRecord | null> {
    const existing = this.reviewsStore.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.reviewsStore.set(id, updated);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('review_schedule').update({
        interval_stage: updated.intervalStage,
        due_date: updated.dueDate,
        status: updated.status,
        retention_score: updated.retentionScore,
        last_reviewed_at: updated.lastReviewedAt
      }).eq('id', id);
    } catch {
      // Offline fallback
    }

    return updated;
  }

  public static async getReviewsForUser(userId: string): Promise<ReviewScheduleRecord[]> {
    const list: ReviewScheduleRecord[] = [];
    for (const r of this.reviewsStore.values()) {
      if (r.userId === userId) {
        list.push(r);
      }
    }
    return list;
  }
}

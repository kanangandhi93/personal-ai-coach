import { DoubtRecord } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class DoubtsRepository {
  private static doubtsStore: Map<string, DoubtRecord> = new Map();

  public static async createDoubt(doubt: Omit<DoubtRecord, 'id' | 'createdAt'>): Promise<DoubtRecord> {
    const id = `doubt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const record: DoubtRecord = {
      ...doubt,
      id,
      createdAt: now
    };

    this.doubtsStore.set(id, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('doubts').insert({
        id: record.id,
        user_id: record.userId,
        lesson_id: record.lessonId,
        concept_id: record.conceptId,
        question: record.question,
        root_misconception: record.rootMisconception,
        status: record.status
      });
    } catch {
      // Offline fallback
    }

    return record;
  }

  public static async getDoubtById(id: string): Promise<DoubtRecord | null> {
    return this.doubtsStore.get(id) || null;
  }

  public static async getDoubtsByUserId(userId: string): Promise<DoubtRecord[]> {
    const results: DoubtRecord[] = [];
    for (const d of this.doubtsStore.values()) {
      if (d.userId === userId) results.push(d);
    }
    return results.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  public static async resolveDoubt(id: string, resolutionData: Partial<DoubtRecord>): Promise<DoubtRecord | null> {
    const existing = this.doubtsStore.get(id);
    if (!existing) return null;

    const updated: DoubtRecord = {
      ...existing,
      ...resolutionData,
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    };

    this.doubtsStore.set(id, updated);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('doubts').update({
        root_misconception: updated.rootMisconception,
        status: 'resolved',
        resolution_summary: updated.alternativeExplanation,
        resolved_at: updated.resolvedAt
      }).eq('id', id);
    } catch {
      // Offline fallback
    }

    return updated;
  }
}

import { SourceReferenceRecord } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class ReferencesRepository {
  private static referencesStore: Map<string, SourceReferenceRecord> = new Map();

  public static async saveReference(ref: Omit<SourceReferenceRecord, 'id' | 'createdAt'>): Promise<SourceReferenceRecord> {
    const id = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const record: SourceReferenceRecord = {
      ...ref,
      id,
      createdAt: now
    };

    this.referencesStore.set(id, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('source_references').insert({
        id: record.id,
        user_id: record.userId,
        concept_id: record.conceptId,
        lesson_id: record.lessonId,
        title: record.title,
        url: record.url,
        author_or_org: record.authorOrOrg,
        version_tag: record.versionTag,
        is_verified: record.isVerified,
        snippet: record.snippet
      });
    } catch {
      // Offline fallback
    }

    return record;
  }

  public static async getReferencesByConcept(conceptId: string): Promise<SourceReferenceRecord[]> {
    const list: SourceReferenceRecord[] = [];
    for (const r of this.referencesStore.values()) {
      if (r.conceptId === conceptId) list.push(r);
    }
    return list;
  }

  public static async getAllReferencesForUser(userId: string): Promise<SourceReferenceRecord[]> {
    const list: SourceReferenceRecord[] = [];
    for (const r of this.referencesStore.values()) {
      if (r.userId === userId) list.push(r);
    }
    return list;
  }
}

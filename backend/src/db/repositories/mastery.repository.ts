import { ConceptMasteryRecord, MasteryLevel } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class MasteryRepository {
  private static masteryStore: Map<string, ConceptMasteryRecord> = new Map();

  public static async saveMastery(record: ConceptMasteryRecord): Promise<ConceptMasteryRecord> {
    const key = `${record.userId}:${record.conceptId}`;
    this.masteryStore.set(key, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('concept_mastery').upsert({
        user_id: record.userId,
        concept_id: record.conceptId,
        current_level: record.currentLevel,
        confidence_score: record.confidenceScore,
        evidence_breakdown: record.evidenceBreakdown,
        reasoning_summary: record.reasoningSummary,
        evaluated_at: record.evaluatedAt
      }, { onConflict: 'user_id,concept_id' });
    } catch {
      // Offline fallback
    }

    return record;
  }

  public static async getMasteryByConcept(userId: string, conceptId: string): Promise<ConceptMasteryRecord | null> {
    const key = `${userId}:${conceptId}`;
    return this.masteryStore.get(key) || null;
  }

  public static async getAllMasteryForUser(userId: string): Promise<ConceptMasteryRecord[]> {
    const list: ConceptMasteryRecord[] = [];
    for (const record of this.masteryStore.values()) {
      if (record.userId === userId) {
        list.push(record);
      }
    }
    return list;
  }

  public static async getMasterySummary(userId: string) {
    const all = await this.getAllMasteryForUser(userId);
    const distribution: Record<MasteryLevel, number> = {
      [MasteryLevel.L0]: 0,
      [MasteryLevel.L1]: 0,
      [MasteryLevel.L2]: 0,
      [MasteryLevel.L3]: 0,
      [MasteryLevel.L4]: 0,
      [MasteryLevel.L5]: 0,
      [MasteryLevel.L6]: 0
    };

    all.forEach(m => {
      distribution[m.currentLevel] = (distribution[m.currentLevel] || 0) + 1;
    });

    const averageConfidence = all.length > 0
      ? Math.round(all.reduce((acc, m) => acc + m.confidenceScore, 0) / all.length)
      : 0;

    return {
      totalConceptsTracked: all.length,
      averageConfidence,
      distribution
    };
  }
}

import { LearningGoal, MasteryLevel, LifecycleStage, LearningPathMode } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export class GoalsRepository {
  // In-memory store fallback for offline/development/test resilience
  private static memoryStore: Map<string, LearningGoal> = new Map();

  public static async createGoal(goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningGoal> {
    const trimmedTitle = goal.title.trim();
    const nowMs = Date.now();

    // Prevent accidental duplicate rapid submissions (within 5 seconds with identical title)
    for (const existing of this.memoryStore.values()) {
      if (
        existing.userId === goal.userId &&
        existing.title.toLowerCase() === trimmedTitle.toLowerCase() &&
        !existing.isArchived
      ) {
        const createdMs = new Date(existing.createdAt).getTime();
        if (nowMs - createdMs < 5000) {
          return existing; // Return existing without creating duplicate
        }
      }
    }

    const id = `goal-${nowMs}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const newGoal: LearningGoal = {
      id,
      userId: goal.userId,
      title: goal.title,
      description: goal.description,
      targetMasteryLevel: goal.targetMasteryLevel || MasteryLevel.L6,
      currentMasteryLevel: goal.currentMasteryLevel || MasteryLevel.L0,
      pathMode: goal.pathMode || LearningPathMode.FULL_MASTERY,
      currentStage: goal.currentStage || LifecycleStage.STAGE_1_PREREQUISITE_ASSESSMENT,
      isArchived: false,
      metadata: goal.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    // Store in memory
    this.memoryStore.set(id, newGoal);

    // Attempt Supabase persistence
    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('learning_goals').insert({
        id: newGoal.id,
        user_id: newGoal.userId,
        title: newGoal.title,
        description: newGoal.description,
        target_mastery_level: newGoal.targetMasteryLevel,
        current_mastery_level: newGoal.currentMasteryLevel,
        path_mode: newGoal.pathMode,
        current_stage: newGoal.currentStage,
        is_archived: newGoal.isArchived,
        metadata: newGoal.metadata
      });
    } catch {
      // In offline/mock mode, memory store is authoritative
    }

    return newGoal;
  }

  public static async getGoalsByUserId(userId: string): Promise<LearningGoal[]> {
    try {
      const supabase = getSupabaseServiceClient();
      const { data, error } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          userId: d.user_id,
          title: d.title,
          description: d.description,
          targetMasteryLevel: d.target_mastery_level,
          currentMasteryLevel: d.current_mastery_level,
          pathMode: d.path_mode,
          currentStage: d.current_stage,
          isArchived: d.is_archived,
          metadata: d.metadata,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));
      }
    } catch {
      // Fallback to memory store
    }

    const memoryGoals: LearningGoal[] = [];
    for (const g of this.memoryStore.values()) {
      if (g.userId === userId && !g.isArchived) {
        memoryGoals.push(g);
      }
    }
    return memoryGoals;
  }

  public static async getGoalById(id: string, userId?: string): Promise<LearningGoal | null> {
    try {
      const supabase = getSupabaseServiceClient();
      let query = supabase.from('learning_goals').select('*').eq('id', id);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          description: data.description,
          targetMasteryLevel: data.target_mastery_level,
          currentMasteryLevel: data.current_mastery_level,
          pathMode: data.path_mode,
          currentStage: data.current_stage,
          isArchived: data.is_archived,
          metadata: data.metadata,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch {
      // Fallback
    }

    const memoryGoal = this.memoryStore.get(id);
    if (memoryGoal && (!userId || memoryGoal.userId === userId)) {
      return memoryGoal;
    }
    return null;
  }

  public static async updateGoal(id: string, updates: Partial<LearningGoal>, userId?: string): Promise<LearningGoal | null> {
    const existing = await this.getGoalById(id, userId);
    if (!existing) return null;

    const updated: LearningGoal = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.memoryStore.set(id, updated);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('learning_goals').update({
        title: updated.title,
        description: updated.description,
        target_mastery_level: updated.targetMasteryLevel,
        current_mastery_level: updated.currentMasteryLevel,
        current_stage: updated.currentStage,
        path_mode: updated.pathMode,
        is_archived: updated.isArchived,
        metadata: updated.metadata,
        updated_at: updated.updatedAt
      }).eq('id', id);
    } catch {
      // Memory store already updated
    }

    return updated;
  }

  public static async deleteGoal(id: string, userId?: string): Promise<boolean> {
    const existing = await this.getGoalById(id, userId);
    if (!existing) return false;

    this.memoryStore.delete(id);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('learning_goals').delete().eq('id', id);
    } catch {
      // Fallback
    }

    return true;
  }
}

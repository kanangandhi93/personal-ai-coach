import { NoteInput } from '@coach/shared';
import { getSupabaseServiceClient } from '../supabase';

export interface NoteRecord extends NoteInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class NotesRepository {
  private static notesStore: Map<string, NoteRecord> = new Map();

  public static async createNote(userId: string, input: NoteInput): Promise<NoteRecord> {
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const record: NoteRecord = {
      ...input,
      id,
      userId,
      createdAt: now,
      updatedAt: now
    };

    this.notesStore.set(id, record);

    try {
      const supabase = getSupabaseServiceClient();
      await supabase.from('notes').insert({
        id: record.id,
        user_id: record.userId,
        lesson_id: record.lessonId,
        concept_id: record.conceptId,
        title: record.title,
        content_markdown: record.contentMarkdown,
        is_bookmarked: record.isBookmarked,
        tags: record.tags
      });
    } catch {
      // Memory fallback
    }

    return record;
  }

  public static async getNotesByUserId(userId: string): Promise<NoteRecord[]> {
    const list: NoteRecord[] = [];
    for (const note of this.notesStore.values()) {
      if (note.userId === userId) {
        list.push(note);
      }
    }
    return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  public static async deleteNote(id: string, userId: string): Promise<boolean> {
    const note = this.notesStore.get(id);
    if (!note || note.userId !== userId) return false;

    this.notesStore.delete(id);
    return true;
  }
}

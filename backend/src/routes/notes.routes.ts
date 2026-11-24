import { Router, Response } from 'express';
import { NoteSchema } from '@coach/shared';
import { NotesRepository } from '../db/repositories/notes.repository';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// List notes & bookmarks
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const notes = await NotesRepository.getNotesByUserId(userId);
    return res.json(notes);
  } catch (error) {
    next(error);
  }
});

// Create note or bookmark
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const validated = NoteSchema.parse(req.body);
    const created = await NotesRepository.createNote(userId, validated);
    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

// Delete note
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user?.id || 'learner-dev';
    const success = await NotesRepository.deleteNote(req.params.id, userId);
    if (!success) return res.status(404).json({ error: 'Note not found' });
    return res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

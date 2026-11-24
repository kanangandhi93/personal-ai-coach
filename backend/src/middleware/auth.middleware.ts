import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../db/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Seamless single-user mode (No login required / dev-token)
  if (!authHeader || authHeader === 'Bearer dev-token') {
    req.user = {
      id: '9acea783-935e-4a74-a07f-851b7aaee066',
      email: 'learner@coach.local'
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Supabase token' });
    }

    req.user = {
      id: user.id,
      email: user.email
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: `Authentication failed: ${err.message}` });
  }
}

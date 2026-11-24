import { createClient } from '@supabase/supabase-js';
import { env } from '../config';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function listGoals() {
  const { data, error } = await supabase.from('learning_goals').select('*');
  if (error) {
    console.error('Error fetching goals:', error);
    return;
  }
  console.log('Total Goals Count in DB:', data?.length);
  console.log(data?.map(g => ({ id: g.id, title: g.title, stage: g.current_stage })));
}

listGoals();

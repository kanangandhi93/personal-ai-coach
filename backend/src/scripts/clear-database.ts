import { createClient } from '@supabase/supabase-js';
import { env } from '../config';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const tables = [
  'attachments',
  'source_references',
  'ai_usage',
  'agent_runs',
  'review_schedule',
  'practical_submissions',
  'practical_tasks',
  'responses',
  'assessment_attempts',
  'assessments',
  'questions',
  'notes',
  'doubts',
  'messages',
  'learning_sessions',
  'concept_mastery',
  'lesson_progress',
  'concepts',
  'lessons',
  'modules',
  'curriculum_versions',
  'learning_goals'
];

async function clearDatabase() {
  console.log(`[Supabase Clear] Connecting to ${env.SUPABASE_URL}...`);

  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.warn(`[Supabase Clear] Warning on table ${table}: ${error.message}`);
      } else {
        console.log(`[Supabase Clear] Table '${table}' cleaned (deleted: ${count ?? 0} rows).`);
      }
    } catch (err: any) {
      console.warn(`[Supabase Clear] Skipped table ${table}: ${err.message}`);
    }
  }

  // Double check goals count
  const { data: remainingGoals } = await supabase.from('learning_goals').select('id');
  console.log(`\n✅ Database wipe complete! Remaining goals in database: ${remainingGoals?.length ?? 0}`);
}

clearDatabase().catch((err) => {
  console.error('[Supabase Clear] Fatal error:', err);
  process.exit(1);
});

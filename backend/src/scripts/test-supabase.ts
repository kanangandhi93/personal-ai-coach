import { createClient } from '@supabase/supabase-js';
import { env } from '../config';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
  console.log('Testing live table write to Supabase...');
  
  // First check if any user exists in auth.users
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  let validUserId: string;

  if (users && users.users && users.users.length > 0) {
    validUserId = users.users[0].id;
    console.log(`Using existing user: ${validUserId} (${users.users[0].email})`);
  } else {
    // Create a default local dev user in Supabase auth
    console.log('Creating initial learner user in Supabase Auth...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'learner@coach.local',
      password: 'CoachPassword123!',
      email_confirm: true
    });
    if (createError) {
      console.log('Auth user create error:', createError.message);
      validUserId = '00000000-0000-0000-0000-000000000001';
    } else {
      validUserId = newUser.user.id;
      console.log(`Created new auth user: ${validUserId}`);
    }
  }

  // Insert a test goal
  const { data, error } = await supabase.from('learning_goals').insert({
    user_id: validUserId,
    title: 'Azure Solutions Architect (AZ-305)',
    target_mastery_level: 'L6',
    current_mastery_level: 'L0',
    path_mode: 'full_mastery',
    current_stage: 1
  }).select();

  if (error) {
    console.log('Insert error:', error.message);
  } else {
    console.log('✅ Goal successfully inserted into live Supabase!', data);
  }
}

testInsert();

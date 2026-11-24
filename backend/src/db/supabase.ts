import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config';

let clientInstance: SupabaseClient | null = null;
let serviceClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  }
  return clientInstance;
}

export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClientInstance) {
    serviceClientInstance = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }
  return serviceClientInstance;
}

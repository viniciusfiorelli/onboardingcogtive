import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'vinicius.fiorelli@cogtive.com',
    password: '123456'
  });
  
  if (authError) {
    console.error('Login error:', authError);
    return;
  }
  
  console.log('Logged in. Invoking sync-pipefy...');
  try {
    const { data, error } = await supabase.functions.invoke('sync-pipefy', {
      body: {} // No projectId -> triggers sync all
    });
    console.log('Error:', error);
    console.log('Data:', data);
  } catch (err) {
    console.error('Catch error:', err);
  }
}
run();

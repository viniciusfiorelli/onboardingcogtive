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
  
  console.log('Logged in. Fetching logs...');
  try {
    const { data, error } = await supabase.from('activity_logs').select('*');
    console.log('Error:', error);
    console.log('Logs count:', data?.length);
    console.log('Sample:', data?.slice(0, 3));
  } catch (err) {
    console.error('Catch error:', err);
  }
}
run();

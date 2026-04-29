import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('Triggering sync-pipefy edge function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('sync-pipefy');
    if (error) {
       console.error('Function Error:', error.message);
    } else {
       console.log('Function Data:', data);
    }
  } catch (err) {
    console.error('Catch error:', err.message);
  }
}

run();

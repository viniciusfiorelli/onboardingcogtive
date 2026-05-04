import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Triggering sync-pipefy with SERVICE_ROLE_KEY...');
  try {
    const { data, error } = await supabase.functions.invoke('sync-pipefy', {
      headers: {
        Authorization: `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    if (error) console.error('Function Error:', error);
    else console.log('Function Data:', data);
  } catch (err) {
    console.error('Catch error:', err.message);
  }
}
run();

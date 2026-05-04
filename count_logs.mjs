import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { count, error } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true });
    
  console.log('Total logs:', count);
  if (error) console.error('Error:', error);
}
run();

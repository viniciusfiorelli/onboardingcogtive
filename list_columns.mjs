import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Listing columns for onboarding_projects...');
  
  const sql = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'onboarding_projects'
    ORDER BY ordinal_position;
  `;
  
  const { data, error } = await supabase.rpc('kickstart_sql', { sql });
  if (error) {
    console.error('Error fetching columns:', error);
  } else {
    // kickstart_sql returns a JSON status object, so we might need a different approach to actually get data
    // if kickstart_sql just EXECUTES and returns success.
    console.log('Result:', data);
  }
}

run();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Using kickstart_sql to check columns...');
  
  const checkSql = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'onboarding_projects'
    AND column_name = 'kickoff_date'
  `;
  
  // Try to use the existing function to just verify if it works
  const { data, error } = await supabase.rpc('kickstart_sql', { sql: checkSql });
  if (error) {
    console.error('Error fetching columns:', error);
  } else {
    console.log('Result:', data);
  }
}

run();

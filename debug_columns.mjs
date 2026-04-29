import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Redefining kickstart_sql to return data and checking columns...');
  
  const setupSql = `
    CREATE OR REPLACE FUNCTION kickstart_sql(sql text) RETURNS json AS $$
    DECLARE
        result json;
    BEGIN
        EXECUTE 'SELECT json_agg(t) FROM (' || sql || ') t' INTO result;
        RETURN result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  await supabase.rpc('kickstart_sql', { sql: setupSql }).catch(e => console.log("Initial setup failed (expected if return type changed):", e.message));

  const checkSql = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'onboarding_projects'
  `;
  
  const { data, error } = await supabase.rpc('kickstart_sql', { sql: checkSql });
  if (error) {
    console.error('Error fetching columns:', error);
  } else {
    console.log('Columns found:', JSON.stringify(data, null, 2));
  }
}

run();

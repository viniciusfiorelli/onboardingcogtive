import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fobxpoyqhzqjafkodkoh.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function test() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Get Karsten's project ID
  const { data: proj } = await supabase
    .from('onboarding_projects')
    .select('id')
    .ilike('client_name', '%karsten%')
    .maybeSingle();
    
  if (!proj) {
    console.error('Karsten project not found!');
    return;
  }
  
  console.log(`Invoking sync-pipefy for Karsten (projectId: ${proj.id})...`);
  
  const res = await fetch(`${supabaseUrl}/functions/v1/sync-pipefy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectId: proj.id })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

test().catch(console.error);

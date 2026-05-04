import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fobxpoyqhzqjafkodkoh.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function test() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const { data: proj } = await supabase
    .from('onboarding_projects')
    .select('id')
    .ilike('client_name', '%karsten%')
    .maybeSingle();
    
  if (!proj) return;
  
  const { data: items, error } = await supabase
    .from('onboarding_checklist_items')
    .select('*')
    .eq('project_id', proj.id);
    
  console.log(`Found ${items?.length} items for Karsten.`);
  if (error) console.error(error);
}

test().catch(console.error);

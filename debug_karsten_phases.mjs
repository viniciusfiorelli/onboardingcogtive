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
  
  const { data: items } = await supabase
    .from('onboarding_checklist_items')
    .select('phase_name, checklist_label')
    .eq('project_id', proj.id);
    
  const phases = new Set(items?.map(i => i.phase_name));
  console.log('Phases found for Karsten in DB:', Array.from(phases));
  console.log('Total items:', items?.length);
}

test().catch(console.error);

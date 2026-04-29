import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: projects } = await supabase.from('onboarding_projects').select('id, client_name').ilike('client_name', '%CENTRAL NUTRITION%');
  
  if (projects && projects.length > 0) {
    const projectId = projects[0].id;
    const { data: items, error } = await supabase.from('onboarding_checklist_items').select('*').eq('project_id', projectId);
    
    if (error) {
       console.error('Error:', error.message);
    } else {
       console.table(items);
    }
  } else {
     console.log('Project not found');
  }
}

run();

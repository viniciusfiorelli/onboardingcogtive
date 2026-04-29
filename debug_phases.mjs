import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: projects } = await supabase.from('onboarding_projects').select('id, client_name').ilike('client_name', '%JA Saúde Animal%');
  
  if (projects && projects.length > 0) {
    const projectId = projects[0].id;
    const { data: phases, error } = await supabase.from('onboarding_phases').select('*').eq('project_id', projectId);
    
    if (error) {
       console.error('Error:', error.message);
    } else {
       console.table(phases);
    }
  } else {
     console.log('Project not found');
  }
}

run();

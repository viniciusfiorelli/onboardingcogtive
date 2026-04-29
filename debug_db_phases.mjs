import { createClient } from '@supabase/supabase-js';

async function debugPhases() {
  const supabase = createClient('https://fobxpoyqhzqjafkodkoh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYnhwb3lxaHpxamFma29ka29oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NjY4OCwiZXhwIjoyMDg4NzUyNjg4fQ.effbuooKWgNIjpJd7Rp1PxKxI12bK-ad_Pyt3vicuZQ');

  const { data: projects, error } = await supabase
    .from('onboarding_projects')
    .select(`
      id,
      pipefy_card_id,
      client_name,
      current_phase,
      updated_at,
      onboarding_phases (
        name,
        status,
        "order"
      )
    `);

  if (error) {
    fs.appendFileSync('debug_output.txt', `Error fetching projects: ${error}\n`);
    return;
  }

  fs.appendFileSync('debug_output.txt', `Total projects in DB: ${projects.length}\n`);
  
  const today = new Date().toISOString().split('T')[0];
  const updatedToday = projects.filter(p => p.updated_at.startsWith(today));
  fs.appendFileSync('debug_output.txt', `Projects updated today (${today}): ${updatedToday.length}\n`);

  projects.forEach(p => {
    fs.appendFileSync('debug_output.txt', `\nProject: ${p.client_name} (Pipefy ID: ${p.pipefy_card_id}) | Updated At: ${p.updated_at}\n`);
    fs.appendFileSync('debug_output.txt', `Current Phase (Project Table): ${p.current_phase}\n`);
    fs.appendFileSync('debug_output.txt', 'Phases in onboarding_phases:\n');
    p.onboarding_phases.sort((a, b) => a.order - b.order).forEach(ph => {
      fs.appendFileSync('debug_output.txt', `  - ${ph.name}: ${ph.status}\n`);
    });
  });
}

const fs = await import('node:fs');
fs.writeFileSync('debug_output.txt', ''); // Clear file
debugPhases();

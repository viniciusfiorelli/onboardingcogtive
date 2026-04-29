import { createClient } from '@supabase/supabase-js';

async function syncFitowayPhases() {
  const supabase = createClient('https://fobxpoyqhzqjafkodkoh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYnhwb3lxaHpxamFma29ka29oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NjY4OCwiZXhwIjoyMDg4NzUyNjg4fQ.effbuooKWgNIjpJd7Rp1PxKxI12bK-ad_Pyt3vicuZQ');
  
  const { data: project } = await supabase.from('onboarding_projects').select('id, current_phase').ilike('client_name', '%Fitoway%').single();
  
  if (!project) {
    console.log('Project Fitoway not found.');
    return;
  }

  const projectId = project.id;
  const phaseName = project.current_phase || '';
  
  const standardPhases = [
    'Triagem',
    'Kick-off',
    'Preparação',
    'Implantação',
    'Operação assistida',
    'Wrap-up',
    'Concluído'
  ];

  const currentPhaseIdx = standardPhases.indexOf(phaseName);
  console.log('Current Phase:', phaseName, 'Index:', currentPhaseIdx);

  const phaseRows = standardPhases.map((name, idx) => {
    let phaseStatus = 'upcoming';
    if (idx < currentPhaseIdx) phaseStatus = 'completed';
    else if (idx === currentPhaseIdx) phaseStatus = 'current';
    else if (currentPhaseIdx === -1 && idx === 0) phaseStatus = 'current';

    return {
      project_id: projectId,
      name: name,
      status: phaseStatus,
      order: idx + 1
    };
  });

  console.log('Deleting existing phases for project:', projectId);
  const { error: delErr } = await supabase.from('onboarding_phases').delete().eq('project_id', projectId);
  if (delErr) console.error('Delete error:', delErr);

  console.log('Inserting phaseRows:', phaseRows.length);
  const { data, error: insErr } = await supabase.from('onboarding_phases').insert(phaseRows).select();
  
  if (insErr) {
    console.error('Insert error details:', JSON.stringify(insErr, null, 2));
  } else {
    console.log('Phases inserted successfully:', data.length);
  }
}

syncFitowayPhases();

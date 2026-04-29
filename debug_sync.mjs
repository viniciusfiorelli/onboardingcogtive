import { writeFileSync } from 'fs';
const SUPABASE_URL = 'https://fobxpoyqhzqjafkodkoh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYnhwb3lxaHpxamFma29ka29oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NjY4OCwiZXhwIjoyMDg4NzUyNjg4fQ.effbuooKWgNIjpJd7Rp1PxKxI12bK-ad_Pyt3vicuZQ';

async function main() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/onboarding_projects?select=client_name,current_phase,pipefy_card_id&order=current_phase,client_name`,
    { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
  );
  const projects = await res.json();
  
  const byPhase = {};
  projects.forEach(p => {
    const phase = p.current_phase || '(sem fase)';
    if (!byPhase[phase]) byPhase[phase] = [];
    byPhase[phase].push(p.client_name);
  });
  
  let output = `Total: ${projects.length}\n\n`;
  Object.entries(byPhase).sort().forEach(([phase, names]) => {
    output += `${phase} (${names.length}):\n`;
    names.forEach(n => output += `  - ${n}\n`);
    output += `\n`;
  });
  
  writeFileSync('/tmp/db_projects.txt', output);
  console.log('Salvo em /tmp/db_projects.txt');
}

main().catch(console.error);

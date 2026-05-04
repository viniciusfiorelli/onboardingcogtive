import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fobxpoyqhzqjafkodkoh.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function test() {
  // Let's get the GT Foods project ID
  const { data: proj } = await supabase
    .from('onboarding_projects')
    .select('*')
    .ilike('client_name', '%GT Foods%')
    .maybeSingle();

  if (!proj) {
    console.error('GT Foods project not found in database!');
    return;
  }

  console.log('Found project:', proj);

  // Now, let's select all checklist items for this project
  const { data: items } = await supabase
    .from('onboarding_checklist_items')
    .select('*')
    .eq('project_id', proj.id);

  console.log(`\nTotal items found in database for GT Foods: ${items?.length}`);

  // Let's group items by phase_name
  const grouped = {};
  items?.forEach(i => {
    const p = i.phase_name || 'Sem fase';
    if (!grouped[p]) grouped[p] = [];
    grouped[p].push(i);
  });

  console.log('\nItems by Phase:');
  for (const [phase, phaseItems] of Object.entries(grouped)) {
    console.log(`- "${phase}": ${phaseItems.length} items`);
    if (phase.toLowerCase().includes('assistida')) {
       phaseItems.forEach(i => {
          console.log(`  * [${i.field_type}] "${i.checklist_label}" | text: "${i.item_text}"`);
       });
    }
  }
}

test().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: projects } = await supabase.from('onboarding_projects').select('*').ilike('client_name', '%CENTRAL NUTRITION%');
  if (!projects || projects.length === 0) return console.log("Not found in db");
  
  const pipefyId = projects[0].pipefy_card_id;
  const pipefyToken = process.env.PIPEFY_API_TOKEN;

  const query = `{ card(id: "${pipefyId}") { id title current_phase { name } fields { name value field { type options } phase_field { phase { name } } } } }`;

  const req = await fetch("https://api.pipefy.com/graphql", {
     method: "POST",
     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
     body: JSON.stringify({ query })
  });

  const res = await req.json();
  const card = res.data?.card;
  if (!card) return console.log("Card not found in pipefy", res);

  console.log(`CARD: ${card.title} - Phase: ${card.current_phase?.name}`);
  card.fields.forEach(f => {
     if (f.value) {
       console.log(`- ${f.name} (Type: ${f.field?.type}, Phase: ${f.phase_field?.phase?.name})`);
       console.log(`  Value: ${String(f.value).substring(0, 50).replace(/\n/g, '\\n')}...`);
     }
  });
}

run();

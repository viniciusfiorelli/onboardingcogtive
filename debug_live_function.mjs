import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fobxpoyqhzqjafkodkoh.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log('Invocando a Edge Function sync-pipefy do Supabase...');
  
  // Use the service role key as Authorization header to bypass auth checking or use it directly
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Call function directly using fetch to make sure the token is passed
  const res = await fetch(`${supabaseUrl}/functions/v1/sync-pipefy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (res.ok) {
    const data = await res.json();
    console.log('\n✅ Sucesso!');
    console.log('Resposta da função:', JSON.stringify(data, null, 2));
  } else {
    const text = await res.text();
    console.error('\n❌ Erro na Edge Function:', res.status, text);
  }
}

run().catch(console.error);

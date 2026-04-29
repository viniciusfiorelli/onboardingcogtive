import 'dotenv/config';

async function trigger() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    return;
  }

  console.log('Triggering batch sync-pipefy...');
  const res = await fetch(`${supabaseUrl}/functions/v1/sync-pipefy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('Raw Response:', text);
  }
}

trigger();

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Reloading schema cache...');
  const { data, error } = await supabase.rpc('kickstart_sql', { sql: 'NOTIFY pgrst, "reload schema";' });
  if (error) {
    console.error('Error reloading schema:', error);
  } else {
    console.log('Schema reload triggered successfully:', data);
  }
}

run();

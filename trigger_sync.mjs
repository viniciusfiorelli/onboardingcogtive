async function trigger() {
  const url = 'https://fobxpoyqhzqjafkodkoh.supabase.co/functions/v1/sync-pipefy';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYnhwb3lxaHpxamFma29ka29oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NjY4OCwiZXhwIjoyMDg4NzUyNjg4fQ.effbuooKWgNIjpJd7Rp1PxKxI12bK-ad_Pyt3vicuZQ';
  
  console.log('Triggering sync-pipefy...');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Trigger error:', err);
  }
}
trigger();

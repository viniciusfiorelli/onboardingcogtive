const pipefyToken = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJQaXBlZnkiLCJpYXQiOjE3NzMyMzc3NzEsImp0aSI6IjUzNTVlMDg2LWUxZjktNDNkOS1hNWY2LTJmZDBlODIxNjlmNiIsInN1YiI6MzA1MzgyMzExLCJ1c2VyIjp7ImlkIjozMDUzODIzMTEsImVtYWlsIjoidmluaWNpdXMuZmlvcmVsbGlAY29ndGl2ZS5jb20ifSwidXNlcl90eXBlIjoiYXV0aGVudGljYXRlZCJ9.FKFszVl4TQ1VYzq4sgxqxVNjb1aaLvqf4ZzJOow_X6jhqsKSBx9627u0qY7T9bWYq3Ba4JFdoYCsnMNuo4gXIg';
const cardId = "1304179544";

async function run() {
  console.log(`Fetching Pipefy card ${cardId}...`);
  const query = `{ card(id: "${cardId}") { id title current_phase { name } fields { name value field { id label type options } phase_field { phase { name } } } } }`;

  const res = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${pipefyToken}`
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  const card = data.data?.card;

  if (!card) {
     console.error('Card not found on Pipefy!', JSON.stringify(data));
     return;
  }

  console.log(`\nCard: "${card.title}" | Current Phase: "${card.current_phase?.name}"`);

  const byPhase = {};
  card.fields?.forEach(cf => {
     const p = cf.phase_field?.phase?.name || "Sem fase";
     if (!byPhase[p]) byPhase[p] = [];
     byPhase[p].push(cf);
  });

  for (const [phase, fields] of Object.entries(byPhase)) {
     if (phase.toLowerCase().includes('assistida') || phase.toLowerCase().includes('wrap')) {
        console.log(`\nPhase: "${phase}" (${fields.length} fields)`);
        fields.forEach(cf => {
           console.log(`  * id: "${cf.field?.id}" | label: "${cf.field?.label || cf.name}" | val: "${cf.value}"`);
        });
     }
  }
}

run().catch(console.error);

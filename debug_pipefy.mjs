import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pipefyToken = process.env.PIPEFY_API_TOKEN;
  const pipeId = process.env.PIPEFY_PIPE_ID || "306842929";

  const query = `{ allCards(pipeId: "${pipeId}", first: 100) { edges { node { id title current_phase { name } fields { name value field { type options } } } } } }`;

  const req = await fetch("https://api.pipefy.com/graphql", {
     method: "POST",
     headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${pipefyToken}`
     },
     body: JSON.stringify({ query })
  });

  const res = await req.json();
  const cards = res.data?.allCards?.edges?.map(e => e.node) || [];
  const central = cards.find(c => c.title.toLowerCase().includes('central nutrition'));

  if (!central) {
    console.log("Central Nutrition not found in first 100 cards");
    return;
  }

  console.log(`CARD: ${central.title} - Phase: ${central.current_phase?.name}`);
  console.log("FIELDS:");
  central.fields.forEach(f => {
     if (f.value) {
       console.log(`-------------`);
       console.log(`Name: ${f.name} (Type: ${f.field?.type})`);
       console.log(`Value: ${f.value.substring(0, 100)}...`);
     }
  });
}

run();

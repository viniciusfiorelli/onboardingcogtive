import dotenv from 'dotenv';
dotenv.config();

const pipefyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwaXBlZnkiLCJzdWIiOiI2MzE2ODEzIiwiaWF0IjoxNzM5MjA5NzA4LCJleHAiOjE3NzIxNjk3MDgsIm5iZiI6MTczOTIwOTcwOCwianRpIjoiMDI3OWFkY2EtNmYxMC00MDRhLWJiMDgtNGFmZTFmNzQwZGY2IiwibWFpbnRhaW5lciI6ZmFsc2V9.UIdqMvK2X4m9S_Jv9o211v5kQO-h8_Xf40079C6_N9U';
const pipeId = "306842929";

const query = `
  {
    allCards(pipeId: "${pipeId}", first: 5) {
      edges {
        node {
          id title
          fields {
            name value
            field { id label type }
          }
        }
      }
    }
  }
`;

async function run() {
  console.log('Fetching cards from Pipefy...');
  const res = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  if (data.errors) {
    console.error('Errors:', JSON.stringify(data.errors, null, 2));
    return;
  }

  const cards = data.data.allCards.edges.map(e => e.node);
  console.log(`Found ${cards.length} cards.\n`);

  for (const card of cards) {
    console.log(`--- Card: ${card.title} (ID: ${card.id}) ---`);
    console.log('Fields related to Kickoff:');
    card.fields.forEach(f => {
        if (f.name.toLowerCase().includes('kickoff') || f.field.label.toLowerCase().includes('kickoff')) {
            console.log(`  - Name: "${f.name}", Label: "${f.field.label}", Value: "${f.value}"`);
        }
    });
    console.log('\n');
  }
}

run();

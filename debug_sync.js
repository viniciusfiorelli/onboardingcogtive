async function debugSync() {
  const pipefyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwaXBlZnkiLCJzdWIiOiI2MzE2ODEzIiwiaWF0IjoxNzM5MjA5NzA4LCJleHAiOjE3NzIxNjk3MDgsIm5iZiI6MTczOTIwOTcwOCwianRpIjoiMDI3OWFkY2EtNmYxMC00MDRhLWJiMDgtNGFmZTFmNzQwZGY2IiwibWFpbnRhaW5lciI6ZmFsc2V9.UIdqMvK2X4m9S_Jv9o211v5kQO-h8_Xf40079C6_N9U';
  const pipeId = '306842929';
  
  const query = `
    {
      allCards(pipeId: "${pipeId}", first: 200) {
        edges {
          node {
            id
            title
            current_phase { name }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.pipefy.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + pipefyToken
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.errors) {
      console.error('Pipefy API Errors:', data.errors);
      return;
    }

    const cards = data.data.allCards.edges.map(e => e.node);
    const fitoway = cards.find(c => c.title.toLowerCase().includes('fitoway'));
    
    if (fitoway) {
      console.log('Fitoway Card Found:', JSON.stringify(fitoway, null, 2));
    } else {
      console.log('Fitoway not found in first 200 cards.');
      console.log('Total cards found:', cards.length);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

debugSync();

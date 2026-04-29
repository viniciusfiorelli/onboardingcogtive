const pipefyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwaXBlZnkiLCJzdWIiOiI2MzE2ODEzIiwiaWF0IjoxNzM5MjA5NzA4LCJleHAiOjE3NzIxNjk3MDgsIm5iZiI6MTczOTIwOTcwOCwianRpIjoiMDI3OWFkY2EtNmYxMC00MDRhLWJiMDgtNGFmZTFmNzQwZGY2IiwibWFpbnRhaW5lciI6ZmFsc2V9.UIdqMvK2X4m9S_Jv9o211v5kQO-h8_Xf40079C6_N9U';
const pipeId = '306842929';

const query = `
  {
    allCards(pipeId: "${pipeId}", first: 200) {
      edges {
        node {
          id title current_phase { name }
          fields {
            name value
            field { id label type options }
            phase_field { phase { name } }
          }
        }
      }
    }
  }
`;

const fs = await import('node:fs');
fs.writeFileSync('simulation_results.txt', '');

function log(msg) {
  console.log(msg);
  fs.appendFileSync('simulation_results.txt', msg + '\n');
}

async function simulateSync() {
  log('Fetching from Pipefy...');
  try {
    const res = await fetch("https://api.pipefy.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
      body: JSON.stringify({ query })
    });

    const pipefyData = await res.json();
    log('Pipefy Data Structure: ' + Object.keys(pipefyData).join(', '));
    if (pipefyData.errors) {
      log('Pipefy Errors: ' + JSON.stringify(pipefyData.errors, null, 2));
      return;
    }
    log('Pipefy Data has data: ' + !!pipefyData.data);

    const cards = pipefyData.data.allCards.edges.map(e => e.node);
    log(`Total cards received: ${cards.length}`);

    const standardPhases = [
      'Triagem',
      'Kick-off',
      'Preparação',
      'Implantação',
      'Operação assistida',
      'Wrap-up',
      'Concluído'
    ];

    const normalize = (s) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

    let successCount = 0;
    let skipCount = 0;

    for (const card of cards) {
      const getField = (name) => card.fields.find((f) => f.name === name)?.value || null;
      const clientName = (getField("Nome do cliente") || card.title || "").trim();
      const phaseName = card.current_phase?.name || '';
      const normPhase = normalize(phaseName);
      const currentPhaseIdx = standardPhases.findIndex(p => normalize(p) === normPhase);

      log(`Processing card: ${card.id} - ${clientName} | Phase: ${phaseName} | norm: ${normPhase} | idx: ${currentPhaseIdx}`);

      if (currentPhaseIdx === -1) {
        log(`  Warning: Phase "${phaseName}" not matched for ${clientName}`);
      }
      
      successCount++;
    }

    log(`\nSummary:`);
    log(`Total: ${cards.length}`);
    log(`Success: ${successCount}`);
    log(`Skipped: ${skipCount}`);
  } catch (err) {
    log('Global Error: ' + err.stack);
  }
}

simulateSync();

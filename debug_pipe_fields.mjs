const pipefyToken = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJQaXBlZnkiLCJpYXQiOjE3NzMyMzc3NzEsImp0aSI6IjUzNTVlMDg2LWUxZjktNDNkOS1hNWY2LTJmZDBlODIxNjlmNiIsInN1YiI6MzA1MzgyMzExLCJ1c2VyIjp7ImlkIjozMDUzODIzMTEsImVtYWlsIjoidmluaWNpdXMuZmlvcmVsbGlAY29ndGl2ZS5jb20ifSwidXNlcl90eXBlIjoiYXV0aGVudGljYXRlZCJ9.FKFszVl4TQ1VYzq4sgxqxVNjb1aaLvqf4ZzJOow_X6jhqsKSBx9627u0qY7T9bWYq3Ba4JFdoYCsnMNuo4gXIg';
const pipeId = "306842929";

async function run() {
  console.log(`Fetching Pipe: ${pipeId}...`);
  const query = `{ pipe(id: "${pipeId}") { id name phases { id name fields { id label type options } } } }`;

  const res = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${pipefyToken}`
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  const phases = data.data?.pipe?.phases;

  if (!phases) {
     console.error('Pipe/Phases not found on Pipefy!', JSON.stringify(data));
     return;
  }

  console.log(`\nPipe found! Total phases: ${phases.length}`);

  phases.forEach(phase => {
     console.log(`\nPhase: "${phase.name}" (${phase.fields?.length || 0} fields in pipe configuration)`);
     phase.fields?.forEach(f => {
        console.log(`  * id: "${f.id}" | label: "${f.label}" | type: "${f.type}"`);
     });
  });
}

run().catch(console.error);

const pipefyToken = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJQaXBlZnkiLCJpYXQiOjE3NzMyMzc3NzEsImp0aSI6IjUzNTVlMDg2LWUxZjktNDNkOS1hNWY2LTJmZDBlODIxNjlmNiIsInN1YiI6MzA1MzgyMzExLCJ1c2VyIjp7ImlkIjozMDUzODIzMTEsImVtYWlsIjoidmluaWNpdXMuZmlvcmVsbGlAY29ndGl2ZS5jb20ifSwidXNlcl90eXBlIjoiYXV0aGVudGljYXRlZCJ9.FKFszVl4TQ1VYzq4sgxqxVNjb1aaLvqf4ZzJOow_X6jhqsKSBx9627u0qY7T9bWYq3Ba4JFdoYCsnMNuo4gXIg';
const pipeId = "306842929";

async function run() {
  console.log('Testando novo token do Pipefy...');
  const query = `{ allCards(pipeId: "${pipeId}", first: 5) { pageInfo { hasNextPage endCursor } edges { node { id title current_phase { name } } } } }`;

  const res = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  
  if (data.error || data.errors) {
    console.error('❌ ERRO:', JSON.stringify(data, null, 2));
    return;
  }

  const cards = data.data?.allCards?.edges || [];
  console.log(`✅ Token válido! Encontrados ${cards.length} cartões na primeira página.`);
  cards.forEach(e => {
    console.log(`  - ${e.node.title} | Fase: ${e.node.current_phase?.name}`);
  });
  console.log(`hasNextPage: ${data.data?.allCards?.pageInfo?.hasNextPage}`);
}

run().catch(console.error);

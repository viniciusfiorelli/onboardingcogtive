import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pipefyToken = process.env.PIPEFY_API_TOKEN;
  const pipeId = process.env.PIPEFY_PIPE_ID || "306842929";
  console.log('Testing Pipefy API...');
  
  const start = Date.now();
  try {
    const query = `{ allCards(pipeId: "${pipeId}", first: 10) { edges { node { id } } } }`;
    const res = await fetch("https://api.pipefy.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(`Response time: ${Date.now() - start}ms`);
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
